const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

function uploadFile(
  destination,
  { prefixName = "", suffixName = "" } = {}
) {
  const storage = multer.diskStorage({
    destination(req, file, callback) {
      if (!destination) {
        return callback(new Error("No destination is found to save the file"), null);
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      callback(null, destination);
    },
    filename(req, file, callback) {
      const extension = path.extname(file.originalname).slice(1); // Remove leading dot from extension

      if (!extension) {
        return callback(
          new Error(`${file.originalname} is an invalid file. Please upload a valid file`),
          null
        );
      }

      // Generate a unique file name with uuid
      let fileName = uuidv4();

      if (prefixName) fileName = `${prefixName}-${fileName}`;
      if (suffixName) fileName = `${fileName}-${suffixName}`;

      const fullFileName = `${fileName}.${extension}`;
      const filePath = path.join(destination, fullFileName);

      // Check if the file already exists in the destination (synchronous check for simplicity)
      try {
        fs.accessSync(filePath, fs.constants.F_OK);
        // If file exists, add additional unique identifier
        fileName = `${fileName}-${Date.now()}`;
      } catch (err) {
        // File doesn't exist, which is what we want
      }
      
      callback(null, `${fileName}.${extension}`);
    },
  });

  return multer({ 
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit (adjust as needed)
    },
    fileFilter: function (req, file, cb) {
      // Optional: Add file type validation
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
      }
    }
  });
}

module.exports = { uploadFile };

// Alternative version with better error handling and async file existence check:
function uploadFileAsync(
  destination,
  { prefixName = "", suffixName = "" } = {}
) {
  const storage = multer.diskStorage({
    destination(req, file, callback) {
      if (!destination) {
        return callback(new Error("No destination is found to save the file"), null);
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      callback(null, destination);
    },
    filename(req, file, callback) {
      const extension = path.extname(file.originalname).slice(1);

      if (!extension) {
        return callback(
          new Error(`${file.originalname} is an invalid file. Please upload a valid file`),
          null
        );
      }

      // Generate a unique file name
      let fileName = uuidv4();

      if (prefixName) fileName = `${prefixName}-${fileName}`;
      if (suffixName) fileName = `${fileName}-${suffixName}`;

      // Use timestamp to ensure uniqueness instead of checking file existence
      const timestamp = Date.now();
      const finalFileName = `${fileName}-${timestamp}.${extension}`;

      callback(null, finalFileName);
    },
  });

  return multer({ 
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });
}