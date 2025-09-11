// helper to promisify upload_stream
const cloudinary = require("../cloudinaryConfig");

exports.uploadToCloudinary = (buffer, folder, fileName) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        format: "jpeg",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
