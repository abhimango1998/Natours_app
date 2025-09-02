const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

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
  const tour = tours.find((t) => t.id === parseInt(id));

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
  const id = parseInt(req.params.id);
  const { name, duration_days } = req.body;
  const tour = tours.find((t) => t.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: `Tour with ID: ${id} is not found!`,
    });
  }

  if (name) {
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

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
