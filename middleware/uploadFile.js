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

      // Generate a unique file name with nanoid
      let fileName = uuidv4();

      if (prefixName) fileName = `${prefixName}-${fileName}`;
      if (suffixName) fileName = `${fileName}-${suffixName}`;

      const fullFileName = `${fileName}.${extension}`;
      const filePath = path.join(destination, fullFileName);

      // Check if the file already exists in the destination
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          // If file exists, generate a new file name to avoid collision
          fileName = `${fileName}-${nanoid(6)}`;
        }
        callback(null, `${fileName}.${extension}`);
      });
    },
  });

  return multer({ storage });
}


  module.exports={uploadFile}