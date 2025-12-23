import multer from 'multer';

// Cấu hình lưu trữ trong bộ nhớ tạm (RAM)
const storage = multer.memoryStorage();

// Validate loại file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload định dạng ảnh!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter
});

export default upload;