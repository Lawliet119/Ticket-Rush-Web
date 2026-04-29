const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho multer dùng Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ticketrush_events', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
  }
});

// Khởi tạo multer middleware
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
});

module.exports = upload;
