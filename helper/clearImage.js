const path = require("path")
const fs = require("fs")

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  if (filePath.startsWith("/")) {
    filePath = filePath.substring(1);
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file:`, err);
    } else {
      console.log(`File deleted successfully: ${filePath}`);
    }
  });
};

module.exports = { clearImage };
