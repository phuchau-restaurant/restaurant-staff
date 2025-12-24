//restaurant-staff/backend/controllers/Supabase/uploadController.js
import storageService from '../../services/Supabase/storageService.js';

class UploadController {
  async upload(req, res) {
    try {
      //  Lấy file từ Multer 
      const file = req.file; 
      const customFileName = req.body.fileName || null;
      const tenantId = req.tenantId;

      // [FIX LỖI CỦA BẠN]: Lấy folder từ body, nếu không có thì mặc định là 'general'
      // Đây chính là biến subFolder mà Service đang cần
      const folder = req.body.folder || 'general';


      // Log ra kiểm tra để chắc chắn
      console.log("Upload Controller - TenantID:", tenantId);
      console.log("Upload Controller - FileName:", customFileName);
      // Case 1: Người dùng gửi File (Multipart)
      if (file) {
        const result = await storageService.uploadImage(file, tenantId, folder, customFileName);
        return res.status(200).json({ 
          message: 'Upload file successful', 
          data: result 
        });
      }

      // Case 2: Người dùng gửi Link ảnh (JSON Body) [NEW]
      // Body sẽ là: { "imageUrl": "https://..." }
      if (req.body.imageUrl) {
        const result = await storageService.uploadFromUrl(req.body.imageUrl, tenantId, folder, customFileName);
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

  // API Upload Batch (Nhiều ảnh)
  uploadBatch = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const files = req.files; // Multer array trả về req.files (số nhiều)
      
      // Lấy danh sách link ảnh từ body (nếu có)
      const imageUrls = req.body.imageUrls; 
      
      // Lấy tên folder từ client (vd: 'dishes', 'menus'), mặc định 'general'
      const folder = req.body.folder || 'general';

      if ((!files || files.length === 0) && (!imageUrls || imageUrls.length === 0)) {
        return res.status(400).json({ message: 'No files or URLs provided' });
      }

      const result = await storageService.uploadBatch(files, imageUrls, tenantId, folder);

      return res.status(200).json({
        success: true,
        message: 'Batch upload processed',
        data: result // Trả về { success: [], failed: [] }
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  // 3. API Get All (List files)
  list = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      // Cho phép lọc theo subFolder: ?folder=dishes
      const folder = req.query.folder || ''; 

      const files = await storageService.listFiles(tenantId, folder);

      return res.status(200).json({
        success: true,
        total: files.length,
        data: files
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  //  API Delete Image
  delete = async (req, res) => {
    try {
      // --- LOG KIỂM TRA ---
      console.log("Headers nhận được:", req.headers['content-type']);
      console.log("Body nhận được:", req.body);
      // --------------------

      const { url } = req.body; 
      
      if (!url) return res.status(400).json({ message: 'URL is required' });

      await storageService.deleteByUrl(url);

      return res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      // Sửa lại log lỗi 500 để biết lỗi server (400 là lỗi client gửi sai)
      console.error(error); 
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new UploadController();