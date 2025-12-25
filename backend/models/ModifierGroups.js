// backend/models/ModifierGroups.js

/**
 * Model cho Modifier Groups
 * Bảng: modifier_groups
 * Các trường: id, tenant_id, name, selection_type, is_required, min_selections, max_selection, display_order, is_active, created_at, updated_at
 */
export class ModifierGroups {
  constructor(data) {
    // Xử lý linh hoạt: data có thể đến từ DB (snake_case) hoặc từ Service (camelCase)
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.name = data.name;
    this.selectionType = data.selection_type || data.selectionType || "single"; // 'single' hoặc 'multiple'
    this.isRequired =
      data.is_required !== undefined
        ? data.is_required
        : data.isRequired !== undefined
        ? data.isRequired
        : false;
    this.minSelections =
      data.min_selections !== undefined
        ? data.min_selections
        : data.minSelections !== undefined
        ? data.minSelections
        : 0;

    this.maxSelections =
      data.max_selections !== undefined
        ? data.max_selections
        : data.maxSelections !== undefined
        ? data.maxSelections
        : 1;
    this.displayOrder =
      data.display_order !== undefined
        ? data.display_order
        : data.displayOrder !== undefined
        ? data.displayOrder
        : 0;
    this.isActive =
      data.is_active !== undefined
        ? data.is_active
        : data.isActive !== undefined
        ? data.isActive
        : true;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;

    // Nested modifiers (options) - for response
    this.modifiers = data.modifiers || data.modifier_options || [];
  }

  /**
   * Mapping chiều vào (Service -> DB): camelCase -> snake_case
   * Hàm này tạo ra object thuần để Supabase có thể insert/update
   */
  toPersistence() {
    return {
      tenant_id: this.tenantId,
      name: this.name,
      selection_type: this.selectionType,
      is_required: this.isRequired,
      min_selections: this.minSelections,
      max_selections: this.maxSelections,
      display_order: this.displayOrder,
      is_active: this.isActive,
    };
  }

  /**
   * Tạo response object cho API
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      selectionType: this.selectionType,
      isRequired: this.isRequired,
      minSelect: this.minSelections,
      maxSelect: this.maxSelection,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      modifiers: this.modifiers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
