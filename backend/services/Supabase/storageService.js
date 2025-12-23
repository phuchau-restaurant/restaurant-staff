import { supabase } from "../../configs/database.js";
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  constructor() {
    this.bucketName = 'imageBucket';
  }

  /**
   * Upload ảnh lên Supabase
   * @param {Object} file - File object từ Multer
   * @param {String} folder - Tên folder (thường là tenantId hoặc category)
   */
  async uploadImage(file, tenantId, customName = '') {
    const fileExt = this._getExtension(file.originalname);

    // 2. Xử lý tên cơ bản (Loại bỏ đuôi nếu user lỡ nhập vào customName)
    let baseName = customName ? customName : file.originalname;
    if (baseName.endsWith(`.${fileExt}`)) {
        baseName = baseName.substring(0, baseName.lastIndexOf('.')); //cắt bỏ đuôi đi để tránh lặp
    }

    const folder = `tenant_${tenantId}`;
    // Tạo tên file chuẩn: Tên - UUID . Đuôi
    const fileName = `${folder}/${baseName}-${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase
      .storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Lấy Public URL để lưu vào Database
    const { data: publicData } = supabase
      .storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return {
      path: fileName, // Lưu cái này để sau này Delete
      url: publicData.publicUrl // Lưu cái này để hiển thị Frontend
    };
  }
//  Upload ảnh từ URL
  async uploadFromUrl(imageUrl, tenantId, customName = '') {
    try {
      // 1. Fetch ảnh từ internet về server
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Cannot fetch image from URL");

      // 2. Chuyển đổi thành Buffer (dữ liệu nhị phân)
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Lấy đuôi file (jpg/png) dựa trên content-type header
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';

      // 3. Giả lập một object file giống như Multer

      // Tạo tên giả lập nếu user không nhập customName
      // Lấy tên file từ URL hoặc đặt mặc định
      const urlFileName = imageUrl.split('/').pop() || `image-${Date.now()}.${extension}`;

      const finalFileName = customName ? customName : urlFileName;
      const fakeFile = {
        originalname: finalFileName,
        buffer: buffer,
        mimetype: contentType
      };

      // 4. Tái sử dụng hàm uploadImage ở trên
      return await this.uploadImage(fakeFile, tenantId, finalFileName);

    } catch (error) {
      throw new Error(`Upload from URL failed: ${error.message}`);
    }
  }
  
  async deleteImage(path) {
    const { error } = await supabase
      .storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
    return true;
  }

  /**
   * Helper function để lấy đuôi file (ví dụ: .jpg, .png)
   */
  _getExtension(originalName) {
    return originalName.split('.').pop();
  }
}

export default new StorageService();