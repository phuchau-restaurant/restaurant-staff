import { useState, useEffect, useCallback } from "react";
import { Plus, Package } from "lucide-react";

// Components
import CategoryFilterBar from "../../components/categories/CategoryFilterBar";
import CategoryCard from "../../components/categories/CategoryCard";
import CategoryListView from "../../components/categories/CategoryListView";
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
  const handleUpdateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await categoryService.updateCategory(
        id,
        categoryData
      );
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
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
   * Xóa danh mục
   */
  const handleDeleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter((cat) => cat.id !== id));
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

  // ==================== HANDLERS ====================

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (categoryData) => {
    if (editingCategory) {
      await handleUpdateCategory(editingCategory.id, categoryData);
    } else {
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
      onConfirm: () => {
        handleDeleteCategory(category.id);
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
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header with Stats */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản Lý Danh Mục
                </h1>
              </div>
              <p className="text-gray-600">
                Quản lý các danh mục món ăn trong hệ thống
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Thêm Danh Mục
            </button>
          </div>

  

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Tổng số</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Ngưng hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 w-full h-full overflow-auto">

        {/* Categories Display */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              Không tìm thấy danh mục nào
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm || statusFilter
                ? "Thử thay đổi bộ lọc hoặc tìm kiếm"
                : "Bắt đầu bằng cách thêm danh mục mới"}
            </p>
          </div>
        ) : viewMode === VIEW_MODES.GRID ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          // List View
          <CategoryListView
            categories={filteredCategories}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
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
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() =>
            setConfirmDialog({
              isOpen: false,
              title: "",
              message: "",
              onConfirm: null,
            })
          }
        />
      )}
    </div>
  );
};

export default CategoryManagementContent;
