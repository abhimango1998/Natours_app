const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });

  return newObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },

//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

// Only accept image, test if uploaded file is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // 1st args is for error, 2nd is for success
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// Configure multer to save uploaded files to a specific directory
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // setting filename to req.file object, so that we can save it to database in updateMe controller
  const fileName = `user-${req.user.id}-${Date.now()}.jpeg`;

  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer(); //.toBuffer() tells Sharp to return the processed image data as a Node.js Buffer object.

  // Upload to Cloudinary
  const result = await uploadToCloudinary(buffer, "users", fileName);
  req.file.filename = result.secure_url;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user post password
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(
      new AppError(
        "You cannot update password from here!. Please use /updatePassword endpoint",
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fileds name that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file && req.file.filename) filteredBody.photo = req.file.filename;

  // 3) Send response
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// This only set active to false, so if in future user want their account again we can give them
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// exports.getUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    success: "fail",
    message: "This route is not defined, Please use /signup instead!",
  });
};

exports.getUser = factory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
