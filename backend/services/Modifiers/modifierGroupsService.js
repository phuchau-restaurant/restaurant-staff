// backend/services/Modifiers/modifierGroupsService.js

/**
 * Service xử lý business logic cho Modifier Groups và Options
 */
class ModifierGroupsService {
  constructor(modifierGroupsRepository, modifierOptionsRepository) {
    this.groupsRepo = modifierGroupsRepository;
    this.optionsRepo = modifierOptionsRepository;
  }

  // ==================== MODIFIER GROUPS ====================

  /**
   * Lấy tất cả modifier groups của tenant (kèm options)
   * @param {string} tenantId - ID của tenant
   * @param {string} search - Từ khóa tìm kiếm (optional)
   */
  async getAllGroups(tenantId, search = "", status) {
    if (!tenantId) throw new Error("Tenant ID is required");

    const groups = await this.groupsRepo.getAllWithOptions(
      tenantId,
      search,
      status
    );
    return groups.map((g) => g.toResponse());
  }

  /**
   * Lấy modifier group theo ID (kèm options)
   * @param {string} id - ID của group
   * @param {string} tenantId - ID của tenant
   */
  async getGroupById(id, tenantId) {
    if (!id) throw new Error("Group ID is required");
    if (!tenantId) throw new Error("Tenant ID is required");

    const group = await this.groupsRepo.getByIdWithOptions(id, tenantId);
    if (!group) throw new Error("Modifier group not found");

    return group.toResponse();
  }

  /**
   * Tạo modifier group mới (có thể kèm options)
   * @param {Object} data - Dữ liệu group
   * @param {string} tenantId - ID của tenant
   */
  async createGroup(data, tenantId) {
    const { name, modifiers, ...groupData } = data;

    // Validation
    if (!name || name.trim() === "") {
      throw new Error("Modifier group name is required");
    }

    // Check trùng tên
    const isDuplicate = await this.groupsRepo.checkDuplicateName(
      tenantId,
      name.trim()
    );
    if (isDuplicate) {
      throw new Error(`Modifier group '${name}' already exists`);
    }

    // Validate selection logic
    this._validateSelectionLogic(groupData);

    // Tạo group
    const newGroup = await this.groupsRepo.create({
      ...groupData,
      name: name.trim(),
      tenantId,
    });

    // Tạo options nếu có
    let createdOptions = [];
    if (modifiers && modifiers.length > 0) {
      const optionsData = modifiers.map((mod) => ({
        ...mod,
        groupId: newGroup.id,
      }));
      createdOptions = await this.optionsRepo.createMany(optionsData);
    }

    // Trả về group với options
    newGroup.modifiers = createdOptions.map((opt) => opt.toResponse());
    return newGroup.toResponse();
  }

  /**
   * Cập nhật modifier group (bao gồm options)
   * @param {string} id - ID của group
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} tenantId - ID của tenant
   */
  async updateGroup(id, data, tenantId) {
    // Kiểm tra group tồn tại
    const existingGroup = await this.groupsRepo.getByIdWithOptions(
      id,
      tenantId
    );
    if (!existingGroup) {
      throw new Error("Modifier group not found");
    }

    const { name, modifiers, ...groupData } = data;

    // Check trùng tên (nếu có thay đổi tên)
    if (name && name.trim() !== existingGroup.name) {
      const isDuplicate = await this.groupsRepo.checkDuplicateName(
        tenantId,
        name.trim(),
        id
      );
      if (isDuplicate) {
        throw new Error(`Modifier group '${name}' already exists`);
      }
    }

    // Validate selection logic
    if (
      groupData.minSelections !== undefined ||
      groupData.maxSelection !== undefined
    ) {
      this._validateSelectionLogic({
        minSelections: groupData.minSelections ?? existingGroup.minSelections,
        maxSelection: groupData.maxSelection ?? existingGroup.maxSelection,
        isRequired: groupData.isRequired ?? existingGroup.isRequired,
      });
    }

    // Cập nhật group
    const updatePayload = { ...groupData };
    if (name) updatePayload.name = name.trim();

    const updatedGroup = await this.groupsRepo.update(id, updatePayload);

    // Xử lý options nếu có
    if (modifiers !== undefined) {
      await this._syncOptions(id, modifiers);
    }

    // Lấy lại group với options mới
    return await this.getGroupById(id, tenantId);
  }

  /**
   * Xóa modifier group (cascade delete options)
   * @param {string} id - ID của group
   * @param {string} tenantId - ID của tenant
   */
  async deleteGroup(id, tenantId) {
    // Kiểm tra group tồn tại
    const existingGroup = await this.groupsRepo.getById(id);
    if (!existingGroup) {
      throw new Error("Modifier group not found");
    }

    // Security check
    if (existingGroup.tenantId !== tenantId) {
      throw new Error("Access denied: Cannot delete this modifier group");
    }

    // Xóa tất cả options trước
    await this.optionsRepo.deleteByGroupId(id);

    // Xóa group
    await this.groupsRepo.delete(id);

    return { success: true, message: "Modifier group deleted successfully" };
  }

  /**
   * Toggle trạng thái active/inactive của group
   */
  async toggleGroupStatus(id, isActive, tenantId) {
    const existingGroup = await this.groupsRepo.getById(id);
    if (!existingGroup) {
      throw new Error("Modifier group not found");
    }

    if (existingGroup.tenantId !== tenantId) {
      throw new Error("Access denied");
    }

    const updatedGroup = await this.groupsRepo.update(id, { isActive });
    return await this.getGroupById(id, tenantId);
  }

  // ==================== MODIFIER OPTIONS ====================

  /**
   * Tạo option mới trong group
   */
  async createOption(groupId, optionData, tenantId) {
    // Kiểm tra group tồn tại và thuộc tenant
    const group = await this.groupsRepo.getById(groupId);
    if (!group) {
      throw new Error("Modifier group not found");
    }
    if (group.tenantId !== tenantId) {
      throw new Error("Access denied");
    }

    // Validation
    if (!optionData.name || optionData.name.trim() === "") {
      throw new Error("Option name is required");
    }

    const newOption = await this.optionsRepo.create({
      ...optionData,
      groupId,
    });

    return newOption.toResponse();
  }

  /**
   * Cập nhật option
   */
  async updateOption(optionId, optionData, tenantId) {
    const option = await this.optionsRepo.getById(optionId);
    if (!option) {
      throw new Error("Modifier option not found");
    }

    // Kiểm tra quyền thông qua group
    const group = await this.groupsRepo.getById(option.groupId);
    if (!group || group.tenantId !== tenantId) {
      throw new Error("Access denied");
    }

    const updatedOption = await this.optionsRepo.update(optionId, optionData);
    return updatedOption.toResponse();
  }

  /**
   * Xóa option
   */
  async deleteOption(optionId, tenantId) {
    const option = await this.optionsRepo.getById(optionId);
    if (!option) {
      throw new Error("Modifier option not found");
    }

    // Kiểm tra quyền thông qua group
    const group = await this.groupsRepo.getById(option.groupId);
    if (!group || group.tenantId !== tenantId) {
      throw new Error("Access denied");
    }

    await this.optionsRepo.delete(optionId);
    return { success: true, message: "Modifier option deleted successfully" };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Validate selection logic
   */
  _validateSelectionLogic(data) {
    const { minSelections, maxSelection, isRequired } = data;

    if (minSelections !== undefined && minSelections < 0) {
      throw new Error("Minimum selections cannot be negative");
    }

    if (maxSelection !== undefined && maxSelection < 1) {
      throw new Error("Maximum selection must be at least 1");
    }

    if (minSelections !== undefined && maxSelection !== undefined) {
      if (minSelections > maxSelection) {
        throw new Error(
          "Minimum selections cannot be greater than maximum selection"
        );
      }
    }

    if (isRequired && minSelections !== undefined && minSelections < 1) {
      throw new Error(
        "Required modifier group must have minimum selections >= 1"
      );
    }
  }

  /**
   * Sync options - xử lý create/update/delete options
   */
  async _syncOptions(groupId, modifiers) {
    // Lấy options hiện tại
    const existingOptions = await this.optionsRepo.getByGroupId(groupId);
    const existingIds = existingOptions.map((opt) => opt.id);
    const incomingIds = modifiers.filter((m) => m.id).map((m) => m.id);

    // Xóa options không còn trong list mới
    for (const existingOpt of existingOptions) {
      if (!incomingIds.includes(existingOpt.id)) {
        await this.optionsRepo.delete(existingOpt.id);
      }
    }

    // Create hoặc Update
    for (const modifier of modifiers) {
      if (modifier.id && existingIds.includes(modifier.id)) {
        // Update existing
        await this.optionsRepo.update(modifier.id, modifier);
      } else {
        // Create new
        await this.optionsRepo.create({
          ...modifier,
          groupId,
        });
      }
    }
  }
}

export default ModifierGroupsService;
