const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user post password
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(new AppError("You cannot update password from here!", 400));
  }

  // 2) Filtered out unwanted fileds name that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

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
