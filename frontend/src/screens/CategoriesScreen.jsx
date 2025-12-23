import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";

// Components
import CategoryFilterBar from "../components/categories/CategoryFilterBar";
import CategoryList from "../components/categories/CategoryList";
import CategoryForm from "../components/categories/CategoryForm";
import AlertModal from "../components/Modal/AlertModal";
import ConfirmModal from "../components/Modal/ConfirmModal";
import { useAlert } from "../hooks/useAlert";

// Services
import * as categoriesService from "../services/categoryService";

/**
 * CategoriesScreen - Màn hình quản lý danh mục menu
 */
const CategoriesScreen = () => {
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();

  // State quản lý confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // State quản lý dữ liệu
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý UI
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("displayOrder");

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    fetchCategories();
  }, [sortBy]);

  useEffect(() => {
    handleFilterAndSort();
  }, [categories, searchTerm]);

  // ==================== API CALLS ====================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.fetchCategories(sortBy);
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      showError("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleFilterAndSort = () => {
    let filtered = [...categories];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa danh mục",
      message: `Bạn có chắc chắn muốn đổi trạng thái danh mục "${category.name}" thành không hoạt động?`,
      onConfirm: () => confirmDelete(category.id),
    });
  };

  const confirmDelete = async (categoryId) => {
    try {
      // Gọi API để update status thành inactive
      await categoriesService.updateCategoryStatus(categoryId, false);
      showSuccess("Đã đổi trạng thái danh mục thành không hoạt động");
      
      // Refresh danh sách
      await fetchCategories();
    } catch (error) {
      showError(error.message || "Không thể cập nhật trạng thái danh mục");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await categoriesService.updateCategoryStatus(categoryId, newStatus);
      showSuccess(
        `Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} danh mục thành công`
      );
      await fetchCategories();
    } catch (error) {
      showError(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, formData);
        showSuccess("Cập nhật danh mục thành công");
      } else {
        await categoriesService.createCategory(formData);
        showSuccess("Tạo danh mục mới thành công");
      }

      setShowForm(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      showError(error.message || "Có lỗi xảy ra");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản Lý Danh Mục
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý danh mục món ăn trong menu
                </p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              <span>Tạo Danh Mục Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filter Bar */}
        <CategoryFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={categories.length}
          filteredCount={filteredCategories.length}
        />

        {/* Category List */}
        <CategoryList
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "Không tìm thấy danh mục phù hợp"
                : "Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!"}
            </p>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Alert Modal */}
      {alert.isOpen && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

      {/* Confirm Modal */}
      {confirmDialog.isOpen && (
        <ConfirmModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}
    </div>
  );
};

export default CategoriesScreen;
