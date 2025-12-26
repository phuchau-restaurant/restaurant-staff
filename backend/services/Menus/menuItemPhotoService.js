// restaurant-staff/backend/services/Menus/menuItemPhotoService.js
import storageService from "../Supabase/storageService.js";

class MenuItemPhotoService {
  constructor(menuItemPhotoRepo) {
    this.menuItemPhotoRepo = menuItemPhotoRepo;
  }

  /**
   * Upload và tạo nhiều ảnh cho món ăn
   * @param {string} dishId 
   * @param {Array} files - Mảng file từ Multer
   * @param {string} tenantId 
   */
  async uploadPhotos(dishId, files, tenantId) {
    if (!dishId) throw new Error("Dish ID is required");
    if (!files || files.length === 0) throw new Error("No photos provided");

    // 1. Upload lên Storage (vào folder 'dishes')
    // Tham số: (files, imageUrls, tenantId, subFolder)
    const uploadResult = await storageService.uploadBatch(files, [], tenantId, 'dishes');

    if (uploadResult.success.length === 0) {
      throw new Error("Failed to upload photos to storage");
    }

    // 2. Chuẩn bị data lưu DB
    const photosToCreate = uploadResult.success.map(fileData => ({
      dish_id: dishId,
      url: fileData.url,
      is_primary: false // Mặc định là false, user tự set primary sau
    }));

    // 3. Lưu vào DB
    return await this.menuItemPhotoRepo.createMany(photosToCreate);
  }

  async deletePhoto(id, tenantId) {
    // 1. Lấy thông tin ảnh để lấy URL xóa trên storage
    const photo = await this.menuItemPhotoRepo.getById(id);
    if (!photo) throw new Error("Photo not found");

    // TODO: Nên check xem dishId của ảnh này có thuộc tenantId không (cần join bảng dishes)
    // Tạm thời bỏ qua bước check tenantId sâu để tập trung vào logic chính

    // 2. Xóa trên Storage (Dùng URL)
    try {
      await storageService.deleteByUrl(photo.url);
    } catch (err) {
      console.warn(`[Warning] Failed to delete file on storage: ${err.message}`);
      // Vẫn tiếp tục xóa trong DB để tránh rác data
    }

    // 3. Xóa trong DB
    return await this.menuItemPhotoRepo.delete(id);
  }

  async setPrimaryPhoto(id) {
    // 1. Lấy ảnh hiện tại để biết nó thuộc dishId nào
    const photo = await this.menuItemPhotoRepo.getById(id);
    if (!photo) throw new Error("Photo not found");

    // 2. Reset tất cả ảnh của món đó về false
    await this.menuItemPhotoRepo.resetPrimaryFlags(photo.dishId);

    // 3. Update ảnh này thành true
    return await this.menuItemPhotoRepo.update(id, { is_primary: true });
  }

  async getPrimaryPhoto(dishId) {
    if(!dishId) throw new Error("Dish ID is required");
    return await this.menuItemPhotoRepo.getPrimaryByDishId(dishId);
  }

  async getPhotosByDishId(dishId) {
    if(!dishId) throw new Error("Dish ID is required");
    return await this.menuItemPhotoRepo.getByDishId(dishId);
  }
}

export default MenuItemPhotoService;