// services/fileUploadService.js
import fs from "fs";
import path from "path";

export const saveFile = (file, folder = "general") => {
  const dir = path.join("uploads", folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const newPath = path.join(dir, file.filename);
  fs.renameSync(file.path, newPath);

  return `/uploads/${folder}/${file.filename}`; // relative path
};

// Optional: delete file if replaced or removed
export const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
