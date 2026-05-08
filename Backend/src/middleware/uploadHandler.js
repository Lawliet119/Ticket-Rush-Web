const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ticketrush_events', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
  }
});


/**
 * Multer middleware configured for Cloudinary storage
 * Handles file uploads and stores them in the 'ticketrush_events' folder
 */
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

module.exports = upload;
