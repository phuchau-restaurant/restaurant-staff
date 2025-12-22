import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";

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
 * CategoriesScreen - Màn hình quản lý danh mục
 * Hiển thị danh sách danh mục với các chức năng:
 * - Lọc theo trạng thái
 * - Tìm kiếm theo tên
 * - Sắp xếp
 * - Xem dạng lưới hoặc danh sách
 * - Thêm, chỉnh sửa, xóa danh mục
 */
const CategoriesScreen = () => {
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

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter và sort phía client
  useEffect(() => {
    handleFilterAndSort();
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
      showAlert("Lỗi", MESSAGES.CREATE_ERROR, "error");
    }
  };

  /**
   * Cập nhật danh mục
   */
  const handleUpdateCategory = async (categoryData) => {
    try {
      const updated = await categoryService.updateCategory(
        editingCategory.id,
        categoryData
      );

      setCategories(
        categories.map((cat) => (cat.id === editingCategory.id ? updated : cat))
      );
      setEditingCategory(null);
      setShowForm(false);
      showAlert("Thành công", MESSAGES.UPDATE_SUCCESS, "success");
    } catch (error) {
      console.error("Update category error:", error);
      showAlert("Lỗi", MESSAGES.UPDATE_ERROR, "error");
    }
  };

  /**
   * Xóa danh mục
   */
  const handleDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(editingCategory.id);
      setCategories(categories.filter((cat) => cat.id !== editingCategory.id));
      setEditingCategory(null);
      setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
      showAlert("Thành công", MESSAGES.DELETE_SUCCESS, "success");
    } catch (error) {
      console.error("Delete category error:", error);
      showAlert("Lỗi", MESSAGES.DELETE_ERROR, "error");
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Filter và sort danh sách danh mục
   */
  const handleFilterAndSort = useCallback(() => {
    const filtered = filterAndSortCategories(
      categories,
      searchTerm,
      sortBy,
      statusFilter
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm, sortBy, statusFilter]);

  /**
   * Xử lý khi bấm edit
   */
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  /**
   * Xử lý khi bấm delete
   */
  const handleDeleteClick = (category) => {
    setEditingCategory(category);
    setConfirmDialog({
      isOpen: true,
      title: "Xóa danh mục",
      message: MESSAGES.DELETE_CONFIRMATION,
      onConfirm: handleDeleteCategory,
    });
  };

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = (categoryData) => {
    if (editingCategory) {
      return handleUpdateCategory(categoryData);
    } else {
      return handleCreateCategory(categoryData);
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

  // ==================== RENDER ====================

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-gray-100 pt-6 pb-6">
        <div className="px-8">
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Thêm Danh Mục
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
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
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">
              Không tìm thấy danh mục nào phù hợp
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

export default CategoriesScreen;
