import multer from "multer";

// Configure Multer storage engine to save files to the 'public/temp' directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Specify the destination directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for the uploaded file
  }
});

// Create a Multer instance with the specified storage configuration
export const upload = multer({
  storage,
});