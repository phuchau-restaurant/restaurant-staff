import { useState, useEffect } from "react";
import { Plus, Settings2 } from "lucide-react";

// Components
import ModifierFilterBar from "../../components/modifiers/ModifierFilterBar";
import ModifierGroupCard from "../../components/modifiers/ModifierGroupCard";
import ModifierListView from "../../components/modifiers/ModifierListView";
import ModifierGroupForm from "../../components/modifiers/ModifierGroupForm";
import AlertModal from "../../components/Modal/AlertModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import Pagination from "../../components/common/Pagination";

// Services & Utils
import * as modifierService from "../../services/modifierService";
import { filterAndSortModifierGroups, countActiveModifiers } from "../../utils/modifierUtils";
import {
  STATUS_OPTIONS,
  MESSAGES,
  VIEW_MODES,
} from "../../constants/modifierConstants";

/**
 * ModifierManagementContent - Màn hình quản lý modifier trong Dashboard
 * Hiển thị danh sách modifier groups với các chức năng:
 * - Lọc theo trạng thái
 * - Tìm kiếm theo tên
 * - Sắp xếp
 * - Xem dạng lưới hoặc danh sách
 * - Thêm, chỉnh sửa, xóa modifier groups
 * - Toggle Active/Inactive
 */
const ModifierManagementContent = () => {
  // ==================== STATE MANAGEMENT ====================
  
  // State quản lý dữ liệu
  const [modifierGroups, setModifierGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState(null);

  // State quản lý UI
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // State quản lý modals
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // ==================== LIFECYCLE ====================

  // Fetch dữ liệu khi page hoặc pageSize thay đổi
  useEffect(() => {
    fetchModifierGroups();
  }, [currentPage, pageSize]);

  // Filter và sort phía client
  useEffect(() => {
    const filtered = filterAndSortModifierGroups(
      modifierGroups,
      searchTerm,
      statusFilter,
      sortBy
    );
    setFilteredGroups(filtered);
  }, [modifierGroups, searchTerm, sortBy, statusFilter]);

  // ==================== API CALLS ====================

  /**
   * Fetch danh sách modifier groups từ API
   */
  const fetchModifierGroups = async () => {
    try {
      setInitialLoading(true);
      const result = await modifierService.fetchModifierGroups(searchTerm, {
        pageNumber: currentPage,
        pageSize: pageSize
      });
      
      // Xử lý response có pagination hoặc không
      if (result.pagination) {
        setModifierGroups(result.data);
        setPaginationInfo(result.pagination);
      } else {
        setModifierGroups(result);
        setPaginationInfo(null);
      }
    } catch (error) {
      console.error("Fetch modifier groups error:", error);
      showAlert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại!", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Xử lý thay đổi số items mỗi trang
   */
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi pageSize
  };

  /**
   * Thêm modifier group mới
   */
  const handleCreateGroup = async (groupData) => {
    try {
      const newGroup = await modifierService.createModifierGroup(groupData);
      setModifierGroups([...modifierGroups, newGroup]);
      setShowForm(false);
      showAlert("Thành công", MESSAGES.GROUP_CREATE_SUCCESS, "success");
    } catch (error) {
      console.error("Create modifier group error:", error);
      showAlert(
        "Lỗi",
        error.message || MESSAGES.CREATE_ERROR,
        "error"
      );
    }
  };

  /**
   * Cập nhật modifier group
   */
  const handleUpdateGroup = async (id, groupData) => {
    try {
      const updatedGroup = await modifierService.updateModifierGroup(id, groupData);
      setModifierGroups(
        modifierGroups.map((g) => (g.id === id ? updatedGroup : g))
      );
      setShowForm(false);
      setEditingGroup(null);
      showAlert("Thành công", MESSAGES.GROUP_UPDATE_SUCCESS, "success");
    } catch (error) {
      console.error("Update modifier group error:", error);
      showAlert(
        "Lỗi",
        error.message || MESSAGES.UPDATE_ERROR,
        "error"
      );
    }
  };

  /**
   * Xóa modifier group (soft delete - set isActive = false)
   */
  const handleDeleteGroup = async (id) => {
    try {
      await modifierService.toggleModifierGroupStatus(id, false);
      setModifierGroups(
        modifierGroups.map((g) =>
          g.id === id ? { ...g, isActive: false } : g
        )
      );
      showAlert("Thành công", MESSAGES.GROUP_DELETE_SUCCESS, "success");
    } catch (error) {
      console.error("Delete modifier group error:", error);
      showAlert(
        "Lỗi",
        error.message || MESSAGES.DELETE_ERROR,
        "error"
      );
    }
  };

  /**
   * Khôi phục modifier group (set isActive = true)
   */
  const handleRestoreGroup = async (group) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục nhóm modifier "${group.name}"?`,
      onConfirm: async () => {
        try {
          await modifierService.toggleModifierGroupStatus(group.id, true);
          setModifierGroups(
            modifierGroups.map((g) =>
              g.id === group.id ? { ...g, isActive: true } : g
            )
          );
          showAlert("Thành công", "Đã khôi phục nhóm modifier thành công", "success");
        } catch (error) {
          console.error("Restore modifier group error:", error);
          showAlert(
            "Lỗi",
            "Không thể khôi phục nhóm modifier. Vui lòng thử lại!",
            "error"
          );
        } finally {
          setConfirmDialog({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          });
        }
      },
    });
  };

  /**
   * Xóa vĩnh viễn modifier group
   */
  const handleDeletePermanent = async (group) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa VĨNH VIỄN nhóm modifier "${group.name}"? Tất cả options trong nhóm này cũng sẽ bị xóa. Hành động này KHÔNG THỂ HOÀN TÁC!`,
      onConfirm: async () => {
        try {
          await modifierService.deleteModifierGroupPermanent(group.id);
          setModifierGroups(modifierGroups.filter((g) => g.id !== group.id));
          showAlert("Thành công", "Đã xóa vĩnh viễn nhóm modifier", "success");
        } catch (error) {
          console.error("Delete permanent error:", error);
          showAlert(
            "Lỗi",
            "Không thể xóa vĩnh viễn nhóm modifier. Vui lòng thử lại!",
            "error"
          );
        } finally {
          setConfirmDialog({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          });
        }
      },
    });
  };

  /**
   * Toggle trạng thái Active/Inactive
   */
  const handleToggleStatus = async (group) => {
    try {
      const newStatus = !group.isActive;
      await modifierService.toggleModifierGroupStatus(group.id, newStatus);
      setModifierGroups(
        modifierGroups.map((g) =>
          g.id === group.id ? { ...g, isActive: newStatus } : g
        )
      );
      showAlert(
        "Thành công",
        `Đã ${newStatus ? "kích hoạt" : "tắt"} nhóm "${group.name}"`,
        "success"
      );
    } catch (error) {
      console.error("Toggle status error:", error);
      showAlert("Lỗi", "Không thể thay đổi trạng thái. Vui lòng thử lại!", "error");
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (groupData) => {
    if (editingGroup) {
      await handleUpdateGroup(editingGroup.id, groupData);
    } else {
      await handleCreateGroup(groupData);
    }
  };

  /**
   * Xử lý đóng form
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  /**
   * Xử lý click edit
   */
  const handleEditClick = (group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  /**
   * Xử lý click delete
   */
  const handleDeleteClick = (group) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa nhóm modifier "${group.name}"?\nTất cả options trong nhóm này cũng sẽ bị xóa.`,
      onConfirm: () => {
        handleDeleteGroup(group.id);
        setConfirmDialog({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  /**
   * Xử lý thêm modifier group mới
   */
  const handleAddNew = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  /**
   * Hiển thị alert
   */
  const showAlert = (title, message, type = "success") => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // ==================== STATISTICS ====================

  const stats = {
    total: modifierGroups.length,
    active: modifierGroups.filter((g) => g.isActive === true).length,
    inactive: modifierGroups.filter((g) => g.isActive === false).length,
    totalModifiers: modifierGroups.reduce(
      (sum, g) => sum + (g.modifiers?.length || 0),
      0
    ),
  };

  // ==================== RENDER ====================

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản Lý Modifier</h1>
              <p className="text-gray-600 mt-1">
                Tổng số: {filteredGroups.length} nhóm modifier
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm Nhóm Modifier
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng nhóm</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Không hoạt động</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng Options</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalModifiers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <ModifierFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Settings2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không có nhóm modifier nào
            </h3>
            <p className="text-gray-500 mb-4">
              Bắt đầu bằng cách thêm nhóm modifier đầu tiên
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm Nhóm Modifier
            </button>
          </div>
        ) : viewMode === VIEW_MODES.GRID ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <ModifierGroupCard
                key={group.id}
                group={group}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                onRestore={handleRestoreGroup}
                onDeletePermanent={handleDeletePermanent}
              />
            ))}
          </div>
        ) : (
          <ModifierListView
            groups={filteredGroups}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
            onRestore={handleRestoreGroup}
            onDeletePermanent={handleDeletePermanent}
          />
        )}

        {/* Pagination */}
        {paginationInfo && (
          <Pagination
            currentPage={paginationInfo.pageNumber}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.totalItems}
            pageSize={paginationInfo.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12, 24, 48, 96]}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <ModifierGroupForm
            group={editingGroup}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          onClose={() =>
            setConfirmDialog({ ...confirmDialog, isOpen: false })
          }
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
        />
      </div>
    </div>
  );
};

export default ModifierManagementContent;
