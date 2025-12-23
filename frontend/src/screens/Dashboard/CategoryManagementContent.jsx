import { useState, useEffect, useCallback } from "react";
import { Plus, Package } from "lucide-react";

// Components
import CategoryFilterBar from "../../components/categories/CategoryFilterBar";
import CategoryCard from "../../components/categories/CategoryCard";
import CategoryList from "../../components/categories/CategoryList";
import CategoryForm from "../../components/categories/CategoryForm";
import AlertModal from "../../components/Modal/AlertModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";

// Services & Utils
import * as categoryService from "../../services/categoryService";
import { filterAndSortCategories } from "../../utils/categoryUtils";
import {
  STATUS_OPTIONS,
  MESSAGES,
  VIEW_MODES,
} from "../../constants/categoryConstants";

/**
 * CategoryManagementContent - Màn hình quản lý danh mục trong Dashboard
 * Hiển thị danh sách danh mục với các chức năng:
 * - Lọc theo trạng thái
 * - Tìm kiếm theo tên
 * - Sắp xếp
 * - Xem dạng lưới hoặc danh sách
 * - Thêm, chỉnh sửa, xóa danh mục
 */
const CategoryManagementContent = () => {
  // ==================== STATE MANAGEMENT ====================

  // State quản lý dữ liệu
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // State quản lý UI
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("displayOrder");

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

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter và sort phía client
  useEffect(() => {
    const filtered = filterAndSortCategories(
      categories,
      searchTerm,
      statusFilter,
      sortBy
    );

    setFilteredCategories(filtered);
  }, [categories, searchTerm, sortBy, statusFilter]);

  // ==================== API CALLS ====================

  /**
   * Fetch danh sách danh mục từ API
   */
  const fetchCategories = async () => {
    try {
      setInitialLoading(true);
      const data = await categoryService.fetchCategories(searchTerm);
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showAlert("Lỗi", "Không thể tải danh mục. Vui lòng thử lại!", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Thêm danh mục mới
   */
  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories([...categories, newCategory]);
      setShowForm(false);
      showAlert("Thành công", MESSAGES.CREATE_SUCCESS, "success");
    } catch (error) {
      console.error("Create category error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể thêm danh mục. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Cập nhật danh mục
   */
  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      await categoryService.updateCategory(categoryId, categoryData);
      await fetchCategories(); // Fetch lại dữ liệu mới nhất
      setShowForm(false);
      setEditingCategory(null);
      showAlert("Thành công", MESSAGES.UPDATE_SUCCESS, "success");
    } catch (error) {
      console.error("Update category error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể cập nhật danh mục. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Toggle trạng thái danh mục (thay vì xóa cứng)
   */
  const handleToggleStatus = async (categoryId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "kích hoạt" : "vô hiệu hóa";

    // Hiển thị confirm modal
    setConfirmDialog({
      isOpen: true,
      title: `Xác nhận ${actionText}`,
      message: `Bạn có chắc chắn muốn ${actionText} danh mục này?`,
      onConfirm: async () => {
        try {
          await categoryService.updateCategoryStatus(categoryId, newStatus);
          // Cập nhật local state
          setCategories(
            categories.map((cat) =>
              cat.category_id === categoryId
                ? { ...cat, is_active: newStatus }
                : cat
            )
          );
          showAlert(
            "Thành công",
            `Đã ${actionText} danh mục thành công`,
            "success"
          );
        } catch (error) {
          console.error("Toggle status error:", error);
          showAlert(
            "Lỗi",
            `Không thể ${actionText} danh mục. Vui lòng thử lại!`,
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
   * Xóa danh mục
   */
  const handleDeleteCategory = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      await fetchCategories();
      showAlert("Thành công", MESSAGES.DELETE_SUCCESS, "success");
    } catch (error) {
      console.error("Delete category error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể xóa danh mục. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Khôi phục danh mục (set is_active = true)
   */
  const handleRestoreCategory = async (category) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục danh mục "${category.name}"?`,
      onConfirm: async () => {
        try {
          await categoryService.updateCategoryStatus(
            category.category_id,
            true
          );
          setCategories(
            categories.map((cat) =>
              cat.category_id === category.category_id
                ? { ...cat, is_active: true }
                : cat
            )
          );
          showAlert(
            "Thành công",
            "Đã khôi phục danh mục thành công",
            "success"
          );
        } catch (error) {
          console.error("Restore category error:", error);
          showAlert(
            "Lỗi",
            "Không thể khôi phục danh mục. Vui lòng thử lại!",
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
   * Xóa vĩnh viễn danh mục
   */
  const handleDeletePermanent = async (category) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa VĨNH VIỄN danh mục "${category.name}"? Hành động này KHÔNG THỂ HOÀN TÁC!`,
      onConfirm: async () => {
        try {
          await categoryService.deleteCategoryPermanent(category.category_id);
          setCategories(
            categories.filter((cat) => cat.category_id !== category.category_id)
          );
          showAlert("Thành công", "Đã xóa vĩnh viễn danh mục", "success");
        } catch (error) {
          console.error("Delete permanent error:", error);
          showAlert(
            "Lỗi",
            "Không thể xóa vĩnh viễn danh mục. Vui lòng thử lại!",
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

  // ==================== HANDLERS ====================

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (categoryData) => {
    if (editingCategory) {
      // --- LOGIC MỚI: Lọc các trường thay đổi ---
      const changedData = {};

      Object.keys(categoryData).forEach((key) => {
        // So sánh giá trị mới và cũ
        // Lưu ý: Cần đảm bảo so sánh đúng kiểu dữ liệu (vd: string vs string)
        if (categoryData[key] !== editingCategory[key]) {
          changedData[key] = categoryData[key];
        }
      });

      // Kiểm tra xem có trường nào thay đổi không
      if (Object.keys(changedData).length === 0) {
        // Nếu không có gì thay đổi, đóng form và thông báo nhẹ (hoặc không làm gì)
        handleCloseForm();
        showAlert("Thông báo", "Không có thay đổi nào được thực hiện.", "info");
        return;
      }

      // Chỉ gửi changedData đi thay vì toàn bộ categoryData
      // Lưu ý: Đảm bảo dùng đúng key ID (id hoặc category_id tùy theo backend của bạn)
      const idToUpdate = editingCategory.id || editingCategory.category_id;
      await handleUpdateCategory(idToUpdate, changedData);
    } else {
      // Tạo mới thì gửi toàn bộ
      await handleCreateCategory(categoryData);
    }
  };

  /**
   * Xử lý đóng form
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  /**
   * Xử lý click edit
   */
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  /**
   * Xử lý click delete
   */
  const handleDeleteClick = (category) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`,
      onConfirm: async () => {
        await handleDeleteCategory(category.id);
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
   * Xử lý thêm danh mục mới
   */
  const handleAddNew = () => {
    setEditingCategory(null);
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
    total: categories.length,
    active: categories.filter((cat) => cat.isActive === true).length,
    inactive: categories.filter((cat) => cat.isActive === false).length,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản Lý Danh Mục
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {filteredCategories.length} danh mục
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Thêm Danh Mục
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tổng số</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Đang hoạt động
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Ngưng hoạt động
              </p>
              <p className="text-3xl font-bold text-gray-600 mt-1">
                {stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <CategoryFilterBar
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

      {/* Categories Display */}
      <div className="mt-6">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy danh mục nào
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm || statusFilter
                ? "Thử thay đổi bộ lọc hoặc tìm kiếm"
                : "Bắt đầu bằng cách thêm danh mục mới"}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={handleAddNew}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Thêm danh mục mới
              </button>
            )}
          </div>
        ) : viewMode === VIEW_MODES.GRID ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onRestore={handleRestoreCategory}
                onDeletePermanent={handleDeletePermanent}
              />
            ))}
          </div>
        ) : (
          // List View
          <CategoryList
            categories={filteredCategories}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleStatus={(category) =>
              handleToggleStatus(category.category_id, category.is_active)
            }
            onRestore={handleRestoreCategory}
            onDeletePermanent={handleDeletePermanent}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <AlertModal
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onClose={() =>
            setConfirmDialog({
              isOpen: false,
              title: "",
              message: "",
              onConfirm: null,
            })
          }
        />
      )}
      {restoreDialog.isOpen && (
        <ConfirmModal
          isOpen={restoreDialog.isOpen}
          title="Khôi phục danh mục"
          message={`Bạn có chắc chắn muốn khôi phục danh mục "${restoreDialog.category?.name}"?`}
          onConfirm={restoreDialog.onConfirm}
          onClose={() =>
            setRestoreDialog({ isOpen: false, category: null, onConfirm: null })
          }
          type="success"
          confirmText="Khôi phục"
        />
      )}
    </div>
  );
};

export default CategoryManagementContent;
