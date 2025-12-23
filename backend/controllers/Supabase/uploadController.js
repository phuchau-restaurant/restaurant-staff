import storageService from '../../services/Supabase/storageService.js';

class UploadController {
  async upload(req, res) {
    try {
      //  Lấy file từ Multer 
      const file = req.file; 
      const customFileName = req.body.fileName || null;
      const tenantId = req.tenantId; 

      // Log ra kiểm tra để chắc chắn
      console.log("Upload Controller - TenantID:", tenantId);
      console.log("Upload Controller - FileName:", customFileName);
      // Case 1: Người dùng gửi File (Multipart)
      if (file) {
        const result = await storageService.uploadImage(file, tenantId, customFileName);
        return res.status(200).json({ 
          message: 'Upload file successful', 
          data: result 
        });
      }

      // Case 2: Người dùng gửi Link ảnh (JSON Body) [NEW]
      // Body sẽ là: { "imageUrl": "https://..." }
      if (req.body.imageUrl) {
        const result = await storageService.uploadFromUrl(req.body.imageUrl, tenantId, customFileName);
        return res.status(200).json({ 
          message: 'Import from URL successful', 
          data: result 
        });
      }

      // Case 3: Không có gì cả
      return res.status(400).json({ 
        message: 'Please provide a file OR an imageUrl' 
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new UploadController();