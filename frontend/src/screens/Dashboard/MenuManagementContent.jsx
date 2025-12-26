import { useState, useEffect } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";

// Components
import MenuFilterBar from "../../components/menus/MenuFilterBar";
import MenuCard from "../../components/menus/MenuCard";
import MenuListView from "../../components/menus/MenuListView";
import MenuForm from "../../components/menus/MenuForm";
import AlertModal from "../../components/Modal/AlertModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import Pagination from "../../components/common/Pagination";

// Services & Utils
import * as menuService from "../../services/menuService";
import * as categoryService from "../../services/categoryService";
import * as modifierService from "../../services/modifierService";
import { filterAndSortMenuItems, getPrimaryImage } from "../../utils/menuUtils";
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

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState(null);

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
  }, [currentPage, pageSize]);

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
    setFilteredMenuItems(filtered);
  }, [menuItems, searchTerm, sortBy, statusFilter, categoryFilter, priceRange]);

  // ==================== API CALLS ====================

  /**
   * Fetch tất cả dữ liệu ban đầu
   */
  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const [menuResult, categoryData, modifierData] = await Promise.all([
        menuService.fetchMenuItems({ pageNumber: currentPage, pageSize: pageSize }),
        categoryService.fetchCategories(),
        modifierService.fetchModifierGroups(),
      ]);
      
      // Xử lý response có pagination hoặc không
      let menuData = [];
      if (menuResult.pagination) {
        menuData = menuResult.data;
        setPaginationInfo(menuResult.pagination);
      } else {
        menuData = Array.isArray(menuResult) ? menuResult : [];
        setPaginationInfo(null);
      }
      
      // Xử lý categoryData có thể có pagination
      const categoryList = categoryData.data || categoryData || [];
      
      // Tạo map categoryId -> categoryName để lookup nhanh
      const categoryMap = {};
      categoryList.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });
      
      // Fetch ảnh cho từng món ăn và map categoryName
      const menuItemsWithImages = await Promise.all(
        menuData.map(async (item) => {
          try {
            const photos = await menuService.getPhotosByDishId(item.id);
            return {
              ...item,
              categoryName: categoryMap[item.categoryId] || "",
              images: photos.map(photo => ({
                id: photo.id,
                url: photo.url,
                isPrimary: photo.isPrimary || photo.is_primary || false
              }))
            };
          } catch (error) {
            // Nếu lỗi thì giữ nguyên item không có images
            return {
              ...item,
              categoryName: categoryMap[item.categoryId] || ""
            };
          }
        })
      );
      
      setMenuItems(menuItemsWithImages);
      setCategories(categoryList);
      setModifierGroups(modifierData.data || modifierData || []);
    } catch (error) {
      console.error("Fetch initial data error:", error);
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
   * Thêm món ăn mới
   */
  const handleCreateMenuItem = async (menuData) => {
    try {
      const newMenuItem = await menuService.createMenuItem(menuData);
      
      // Upload images if any
      let uploadedPhotos = [];
      if (menuData.newImages && menuData.newImages.length > 0) {
        // Upload tất cả ảnh một lần (API hỗ trợ multi-upload)
        uploadedPhotos = await menuService.uploadMenuImage(newMenuItem.id, menuData.newImages);
        
        // Set ảnh đầu tiên làm primary nếu có upload thành công
        if (uploadedPhotos && uploadedPhotos.length > 0) {
          await menuService.setPrimaryImage(uploadedPhotos[0].id);
          
          // Cập nhật imageUrl vào database để khi load lại trang vẫn có ảnh
          const primaryPhotoUrl = uploadedPhotos[0].url;
          await menuService.updateMenuItem(newMenuItem.id, { imageUrl: primaryPhotoUrl });
          
          // Gán imgUrl từ ảnh primary để hiển thị ngay
          newMenuItem.imgUrl = primaryPhotoUrl;
          newMenuItem.images = uploadedPhotos.map(p => ({
            id: p.id,
            url: p.url,
            isPrimary: p.isPrimary || p.is_primary
          }));
        }
      }

      // Attach modifier groups
      if (menuData.selectedModifierGroups && menuData.selectedModifierGroups.length > 0) {
        for (const groupId of menuData.selectedModifierGroups) {
          await modifierService.addDishModifierGroup(newMenuItem.id, groupId);
        }
      }

      // Thêm món mới vào state thay vì fetch lại toàn bộ
      setMenuItems(prev => [...prev, newMenuItem]);
      
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

      // Sync modifier groups
      if (menuData.selectedModifierGroups !== undefined) {
        await modifierService.syncDishModifierGroups(id, menuData.selectedModifierGroups);
      }

      // Delete images if any
      if (menuData.imagesToDelete && menuData.imagesToDelete.length > 0) {
        for (const imageId of menuData.imagesToDelete) {
          await menuService.deleteMenuImage(imageId);
        }
      }

      // Upload new images if any
      let uploadedPhotos = [];
      if (menuData.newImages && menuData.newImages.length > 0) {
        // Upload tất cả ảnh một lần (API hỗ trợ multi-upload)
        uploadedPhotos = await menuService.uploadMenuImage(id, menuData.newImages);
        
        // Nếu chưa có ảnh primary, set ảnh đầu tiên làm primary
        const hasExistingPrimary = menuData.images?.some(img => img.isPrimary);
        if (!hasExistingPrimary && uploadedPhotos && uploadedPhotos.length > 0) {
          await menuService.setPrimaryImage(uploadedPhotos[0].id);
          
          // Cập nhật imageUrl vào database để khi load lại trang vẫn có ảnh
          const primaryPhotoUrl = uploadedPhotos[0].url;
          await menuService.updateMenuItem(id, { imageUrl: primaryPhotoUrl });
        }
      }

      // Set primary image if specified (chỉ khi là ảnh cũ, không phải ảnh mới upload)
      if (menuData.primaryImageId && !menuData.primaryImageId.toString().startsWith('new-')) {
        await menuService.setPrimaryImage(menuData.primaryImageId);
        
        // Cập nhật imageUrl vào database khi thay đổi ảnh chính
        const primaryImage = menuData.images?.find(img => img.id === menuData.primaryImageId);
        if (primaryImage?.url) {
          await menuService.updateMenuItem(id, { imageUrl: primaryImage.url });
        }
      }

      // Cập nhật state trực tiếp thay vì fetch lại
      setMenuItems(prev => prev.map(item => {
        if (item.id === id) {
          // Tính toán danh sách ảnh mới
          const remainingImages = (menuData.images || [])
            .filter(img => !menuData.imagesToDelete?.includes(img.id));
          const newUploadedImages = (uploadedPhotos || []).map(p => ({
            id: p.id,
            url: p.url,
            isPrimary: p.isPrimary || p.is_primary
          }));
          const allImages = [...remainingImages, ...newUploadedImages];
          
          return {
            ...item,
            name: menuData.name,
            description: menuData.description,
            price: menuData.price,
            categoryId: menuData.categoryId,
            isAvailable: menuData.isAvailable,
            imgUrl: getPrimaryImage(allImages)?.url || item.imgUrl,
            images: allImages
          };
        }
        return item;
      }));

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
   * Xóa món ăn (soft delete - set isAvailable = false)
   */
  const handleDeleteMenuItem = async (id) => {
    try {
      // Chỉ soft delete - set isAvailable = false
      await menuService.updateMenuItemStatus(id, false);
      setMenuItems(
        menuItems.map((item) =>
          item.id === id ? { ...item, isAvailable: false } : item
        )
      );
      showAlert("Thành công", "Món ăn đã được chuyển sang trạng thái ngừng bán", "success");
    } catch (error) {
      console.error("Delete menu item error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể xóa món ăn. Vui lòng thử lại!",
        "error"
      );
    }
  };

  /**
   * Khôi phục món ăn (set isAvailable = true)
   */
  const handleRestoreMenuItem = async (menuItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục món "${menuItem.name}"?`,
      onConfirm: async () => {
        try {
          await menuService.updateMenuItemStatus(menuItem.id, true);
          setMenuItems(
            menuItems.map((item) =>
              item.id === menuItem.id ? { ...item, isAvailable: true } : item
            )
          );
          showAlert("Thành công", "Đã khôi phục món ăn thành công", "success");
        } catch (error) {
          console.error("Restore menu item error:", error);
          showAlert(
            "Lỗi",
            "Không thể khôi phục món ăn. Vui lòng thử lại!",
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
   * Xóa vĩnh viễn món ăn
   */
  const handleDeletePermanent = async (menuItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa VĨNH VIỄN món "${menuItem.name}"? Hành động này KHÔNG THỂ HOÀN TÁC!`,
      onConfirm: async () => {
        try {
          await menuService.deleteMenuItemPermanent(menuItem.id);
          setMenuItems(menuItems.filter((item) => item.id !== menuItem.id));
          showAlert("Thành công", "Đã xóa vĩnh viễn món ăn", "success");
        } catch (error) {
          console.error("Delete permanent error:", error);
          showAlert(
            "Lỗi",
            "Không thể xóa vĩnh viễn món ăn. Vui lòng thử lại!",
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
  const handleEditClick = async (menuItem) => {
    try {
      // Fetch chi tiết món để lấy đầy đủ thông tin (có thể bao gồm images)
      const menuDetail = await menuService.fetchMenuItemById(menuItem.id);
      
      // Fetch modifier groups đã gắn cho dish này
      const attachedModifiers = await modifierService.fetchDishModifierGroups(menuItem.id);
      
      // Lấy danh sách groupId từ response
      const selectedModifierGroupIds = attachedModifiers.map(item => item.groupId || item.id);
      
      // Fetch tất cả ảnh của món ăn từ API
      let images = [];
      try {
        const dishPhotos = await menuService.getPhotosByDishId(menuItem.id);
        if (dishPhotos && dishPhotos.length > 0) {
          images = dishPhotos.map(photo => ({
            id: photo.id,
            url: photo.url,
            isPrimary: photo.isPrimary || photo.is_primary || false
          }));
        }
      } catch (photoError) {
        console.warn("Could not fetch dish photos:", photoError);
      }

      // Nếu API không trả về ảnh, fallback sang imgUrl
      if (images.length === 0 && menuDetail.imgUrl) {
        images = [
          {
            id: `primary-${menuDetail.id}`,
            url: menuDetail.imgUrl,
            isPrimary: true,
          },
        ];
      }

      // Cập nhật menuItem với modifier groups đã chọn và images
      const menuItemWithModifiers = {
        ...menuDetail,
        id: menuItem.id,
        images,
        modifierGroups: selectedModifierGroupIds.map(id => ({ id })),
      };
      
      setEditingMenuItem(menuItemWithModifiers);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching dish details:", error);
      // Nếu lỗi thì vẫn mở form nhưng dùng data từ state
      setEditingMenuItem({
        ...menuItem,
        images: menuItem.images || []
      });
      setShowForm(true);
    }
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
                onRestore={handleRestoreMenuItem}
                onDeletePermanent={handleDeletePermanent}
              />
            ))}
          </div>
        ) : (
          <MenuListView
            menuItems={filteredMenuItems}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onRestore={handleRestoreMenuItem}
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
