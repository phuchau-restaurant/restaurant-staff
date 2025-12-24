//restaurant-staff/backend/services/Supabase/storageService.js
import { supabase } from "../../configs/database.js";
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  constructor() {
    this.bucketName = 'imageBucket';
    // Base URL của Supabase Storage để phục vụ việc parse đường dẫn khi xóa
    // Ví dụ: https://xyz.supabase.co/storage/v1/object/public/imageBucket/
    this.bucketBaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${this.bucketName}/`;
  }

 /**
   * Upload MỘT ảnh (Core function)
   * @param {Object} file - File object
   * @param {String} tenantId 
   * @param {String} subFolder - Tên folder con (vd: 'dishes', 'categories')
   */
  async uploadImage(file, tenantId, subFolder = 'general', customName = '') {
    const fileExt = this._getExtension(file.originalname);

    // 2. Xử lý tên cơ bản (Loại bỏ đuôi nếu user lỡ nhập vào customName)
    let baseName = customName ? customName : file.originalname;
    if (baseName.endsWith(`.${fileExt}`)) {
        baseName = baseName.substring(0, baseName.lastIndexOf('.')); //cắt bỏ đuôi đi để tránh lặp
    }

    // Slugify tên file để tránh ký tự đặc biệt
    baseName = this._slugify(baseName); 

    // Cấu trúc: tenant_{id}/{subFolder}/{fileName}
    const folderPath = `tenant_${tenantId}/${subFolder}`;
    const fileName = `${folderPath}/${baseName}-${uuidv4()}.${fileExt}`;

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
  /**
   * Upload NHIỀU ảnh (Files + URLs)
   */
  async uploadBatch(files, imageUrls, tenantId, subFolder = 'general') {
    const results = [];
    const errors = [];

    // 1. Xử lý File cứng (từ Multer)
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, tenantId, subFolder)
          .then(res => results.push(res))
          .catch(err => errors.push({ file: file.originalname, error: err.message }))
      );
      await Promise.all(uploadPromises);
    }

    // 2. Xử lý Link ảnh (URL)
    if (imageUrls && imageUrls.length > 0) {
      // imageUrls có thể là string hoặc array string, cần chuẩn hóa
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      
      const urlPromises = urls.map(url => 
        this.uploadFromUrl(url, tenantId, subFolder, '')
          .then(res => results.push(res))
          .catch(err => errors.push({ url: url, error: err.message }))
      );
      await Promise.all(urlPromises);
    }

    return { success: results, failed: errors };
  }

//  Upload ảnh từ URL
  async uploadFromUrl(imageUrl, tenantId, subFolder = 'general', customName = '') {
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
      return await this.uploadImage(fakeFile, tenantId, subFolder, finalFileName);

    } catch (error) {
      throw new Error(`Upload from URL failed: ${error.message}`);
    }
  }
  /**
   * Xóa ảnh dựa trên URL
   * Lý do chọn URL: Client thường chỉ lưu URL trong DB, không lưu path.
   */
  async deleteByUrl(fullUrl) {
    // Logic: Cần trích xuất "path" từ "fullUrl"
    // FullUrl: https://.../imageBucket/tenant_123/dishes/abc.jpg
    // Path cần lấy: tenant_123/dishes/abc.jpg

    if (!fullUrl.includes(this.bucketName)) {
        throw new Error("Invalid URL: Does not belong to this bucket");
    }

    // Tách lấy phần path sau bucket name
    // Cách đơn giản nhất là split
    const parts = fullUrl.split(`${this.bucketName}/`);
    if (parts.length < 2) throw new Error("Could not parse file path");
    
    const filePath = parts[1]; // Lấy phần đuôi

    const { error } = await supabase
      .storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
    return true;
  }
  /**
   * Lấy danh sách file trong 1 folder
   */
  async listFiles(tenantId, subFolder = '') {
    const folderPath = subFolder ? `tenant_${tenantId}/${subFolder}` : `tenant_${tenantId}`;
    
    const { data, error } = await supabase
      .storage
      .from(this.bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw new Error(`List files failed: ${error.message}`);
    
    // Map thêm Full URL để client dễ dùng
    return data.map(item => ({
        name: item.name,
        id: item.id,
        metadata: item.metadata,
        url: `${this.bucketBaseUrl}${folderPath}/${item.name}`
    }));
  }

  //Tên ban đầu: deleteImgage
  async deleteByPath(path) {
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
  // Thêm hàm này vào cuối class StorageService
  _slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .normalize('NFD') // Tách dấu ra khỏi ký tự (ví dụ: "é" thành "e" + "´")
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/[^\w\-.]+/g, '') // Xóa tất cả các ký tự không phải chữ, số, gạch ngang, chấm
      .replace(/\-\-+/g, '-') // Thay thế nhiều dấu gạch ngang liên tiếp bằng 1 dấu
      .replace(/^-+/, '') // Xóa gạch ngang ở đầu
      .replace(/-+$/, ''); // Xóa gạch ngang ở cuối
  }
}

export default new StorageService();