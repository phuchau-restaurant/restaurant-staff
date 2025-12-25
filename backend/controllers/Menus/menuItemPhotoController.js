class MenuItemPhotoController {
  constructor(menuItemPhotoService) {
    this.menuItemPhotoService = menuItemPhotoService;
  }

  // [POST] /api/admin/menu/items/photos
  // Form-data: { dishId: 1, images: [file1, file2] }
  upload = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const files = req.files; // Từ uploadArray
      const { dishId } = req.body;

      const result = await this.menuItemPhotoService.uploadPhotos(dishId, files, tenantId);

      return res.status(201).json({
        success: true,
        message: "Photos uploaded successfully",
        data: result
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // [DELETE] /api/admin/menu/items/photos/:id
  delete = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.menuItemPhotoService.deletePhoto(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Photo deleted successfully"
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // [PATCH] /api/admin/menu/items/photos/:id
  setPrimary = async (req, res) => {
    try {
      const { id } = req.params;
      
      const updatedPhoto = await this.menuItemPhotoService.setPrimaryPhoto(id);

      return res.status(200).json({
        success: true,
        message: "Set primary photo successfully",
        data: updatedPhoto
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // [GET] /api/admin/menu/items/photos/primary
  // Body: { dish_id: 123 }
  getPrimary = async (req, res) => {
    try {
      const { dishId } = req.body; // Lấy từ Body theo yêu cầu

      const photo = await this.menuItemPhotoService.getPrimaryPhoto(dishId);

      if (!photo) {
          return res.status(404).json({ 
              success: false, 
              message: "No primary photo found for this dish" 
          });
      }

      return res.status(200).json({
        success: true,
        data: photo
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
  getByDishId = async (req, res) => {
    try {
      const { dishId } = req.query; // Lấy từ query parameter
      const photos = await this.menuItemPhotoService.getPhotosByDishId(dishId);

      return res.status(200).json({
        success: true,
        data: photos
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default MenuItemPhotoController;