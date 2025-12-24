import { useState, useEffect } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";

// Components
import MenuFilterBar from "../../components/menus/MenuFilterBar";
import MenuCard from "../../components/menus/MenuCard";
import MenuListView from "../../components/menus/MenuListView";
import MenuForm from "../../components/menus/MenuForm";
import AlertModal from "../../components/Modal/AlertModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";

// Services & Utils
import * as menuService from "../../services/menuService";
import * as categoryService from "../../services/categoryService";
import * as modifierService from "../../services/modifierService";
import { filterAndSortMenuItems } from "../../utils/menuUtils";
import {
  STATUS_OPTIONS,
  MESSAGES,
  VIEW_MODES,
  PRICE_RANGES,
} from "../../constants/menuConstants";

/**
 * MenuManagementContent - Màn hình quản lý món ăn trong Dashboard
 * Hiển thị danh sách món ăn với các chức năng:
 * - Lọc theo trạng thái, danh mục, giá
 * - Tìm kiếm theo tên
 * - Sắp xếp
 * - Xem dạng lưới hoặc danh sách
 * - Thêm, chỉnh sửa, xóa món ăn
 * - Upload nhiều ảnh, xóa ảnh, set ảnh chính
 * - Gắn modifier groups
 */
const MenuManagementContent = () => {
  // ==================== STATE MANAGEMENT ====================
  
  // State quản lý dữ liệu
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // State quản lý UI
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showForm, setShowForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
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
    fetchInitialData();
  }, []);

  // Filter và sort phía client
  useEffect(() => {
    const filtered = filterAndSortMenuItems(
      menuItems,
      searchTerm,
      statusFilter,
      categoryFilter,
      priceRange,
      sortBy
    );
    console.log(filtered);
    setFilteredMenuItems(filtered);
  }, [menuItems, searchTerm, sortBy, statusFilter, categoryFilter, priceRange]);

  // ==================== API CALLS ====================

  /**
   * Fetch tất cả dữ liệu ban đầu
   */
  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const [menuData, categoryData, modifierData] = await Promise.all([
        menuService.fetchMenuItems(),
        categoryService.fetchCategories(),
        modifierService.fetchModifierGroups(),
      ]);
      setMenuItems(menuData);
      setCategories(categoryData);
      setModifierGroups(modifierData);
    } catch (error) {
      console.error("Fetch initial data error:", error);
      showAlert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại!", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Thêm món ăn mới
   */
  const handleCreateMenuItem = async (menuData) => {
    try {
      const newMenuItem = await menuService.createMenuItem(menuData);
      
      // Upload images if any
      if (menuData.newImages && menuData.newImages.length > 0) {
        for (const file of menuData.newImages) {
          await menuService.uploadMenuImage(newMenuItem.id, file);
        }
      }

      // Attach modifier groups
      if (menuData.selectedModifierGroups && menuData.selectedModifierGroups.length > 0) {
        await menuService.attachModifierGroups(newMenuItem.id, menuData.selectedModifierGroups);
      }

      // Refresh data
      const updatedMenuItems = await menuService.fetchMenuItems();
      setMenuItems(updatedMenuItems);
      
      setShowForm(false);
      showAlert("Thành công", MESSAGES.CREATE_SUCCESS, "success");
    } catch (error) {
      console.error("Create menu item error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể thêm món ăn. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Cập nhật món ăn
   */
  const handleUpdateMenuItem = async (id, menuData) => {
    try {
      await menuService.updateMenuItem(id, menuData);

      // Delete images if any
      if (menuData.imagesToDelete && menuData.imagesToDelete.length > 0) {
        for (const imageId of menuData.imagesToDelete) {
          await menuService.deleteMenuImage(id, imageId);
        }
      }

      // Upload new images if any
      if (menuData.newImages && menuData.newImages.length > 0) {
        for (const file of menuData.newImages) {
          await menuService.uploadMenuImage(id, file);
        }
      }

      // Set primary image
      if (menuData.primaryImageId) {
        await menuService.setPrimaryImage(id, menuData.primaryImageId);
      }

      // Attach modifier groups
      if (menuData.selectedModifierGroups) {
        await menuService.attachModifierGroups(id, menuData.selectedModifierGroups);
      }

      // Refresh data
      const updatedMenuItems = await menuService.fetchMenuItems();
      setMenuItems(updatedMenuItems);

      setShowForm(false);
      setEditingMenuItem(null);
      showAlert("Thành công", MESSAGES.UPDATE_SUCCESS, "success");
    } catch (error) {
      console.error("Update menu item error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể cập nhật món ăn. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Xóa món ăn (soft delete)
   */
  const handleDeleteMenuItem = async (id) => {
    try {
      await menuService.deleteMenuItem(id);
      setMenuItems(menuItems.filter((item) => item.id !== id));
      showAlert("Thành công", MESSAGES.DELETE_SUCCESS, "success");
    } catch (error) {
      console.error("Delete menu item error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể xóa món ăn. Vui lòng thử lại!",
        "error"
      );
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (menuData) => {
    if (editingMenuItem) {
      await handleUpdateMenuItem(editingMenuItem.id, menuData);
    } else {
      await handleCreateMenuItem(menuData);
    }
  };

  /**
   * Xử lý đóng form
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMenuItem(null);
  };

  /**
   * Xử lý click edit
   */
  const handleEditClick = (menuItem) => {
    setEditingMenuItem(menuItem);
    setShowForm(true);
  };

  /**
   * Xử lý click delete
   */
  const handleDeleteClick = (menuItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa món "${menuItem.name}"?`,
      onConfirm: () => {
        handleDeleteMenuItem(menuItem.id);
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
   * Xử lý thêm món ăn mới
   */
  const handleAddNew = () => {
    setEditingMenuItem(null);
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
    total: menuItems.length,
    available: menuItems.filter((item) => item.isAvailable === true).length,
    unavailable: menuItems.filter((item) => item.isAvailable === false).length,
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
              <h1 className="text-3xl font-bold text-gray-800">Quản Lý Món Ăn</h1>
              <p className="text-gray-600 mt-1">
                Tổng số: {filteredMenuItems.length} món ăn
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm Món Ăn
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng số</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đang bán</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Ngừng bán</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.unavailable}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <MenuFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          priceRanges={PRICE_RANGES}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content */}
        {filteredMenuItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không có món ăn nào
            </h3>
            <p className="text-gray-500 mb-4">
              Bắt đầu bằng cách thêm món ăn đầu tiên
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm Món Ăn
            </button>
          </div>
        ) : viewMode === VIEW_MODES.GRID ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenuItems.map((item) => (
              <MenuCard
                key={item.id}
                menuItem={item}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <MenuListView
            menuItems={filteredMenuItems}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <MenuForm
            menuItem={editingMenuItem}
            categories={categories}
            modifierGroups={modifierGroups}
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

export default MenuManagementContent;
