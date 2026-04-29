const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "YES" : "NO",
  api_key: process.env.CLOUDINARY_API_KEY ? "YES" : "NO",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "YES" : "NO"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "medical_reports",
      resource_type: "auto",
      public_id: `report_${Date.now()}`,
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
