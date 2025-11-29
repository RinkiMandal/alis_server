// utility/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const basePath = "uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || ""; // dynamic folder
    const uploadPath = path.join(basePath, folder);

    // Create folder if not exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP images are allowed"));
    }
    cb(null, true);
  },
});

export default upload;
