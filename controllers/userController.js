const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

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

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    },
  );
};

exports.getUser = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((t) => t.id === parseInt(id, 10));

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.updateUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body;
  const tour = tours.find((t) => t.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: `Tour with ID: ${id} is not found!`,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (id > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: `Tour with ID: ${id} is not found!`,
    });
  }

  const newTours = tours.filter((t) => t.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(newTours),
    (err) => {
      res.status(204).json({
        status: "success",
        data: null,
      });
    },
  );
};
