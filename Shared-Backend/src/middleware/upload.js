import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const err = new Error(
      `Invalid file format: ${file.mimetype}. Allowed image formats are JPG, JPEG, PNG, and WEBP.`
    );
    err.statusCode = 400;
    cb(err, false);
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 5, // Maximum 5 images per claim
  },
  fileFilter,
});
