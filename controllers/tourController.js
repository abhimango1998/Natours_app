const fs = require("fs");

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

const Tour = require("../models/tourModel");

exports.getTours = (req, res) => {
  res.status(200).json({
    status: "success",
    time_of_request: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

// exports.createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: "success",
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );
// };

exports.createTour = async (req, res) => {
  const { name, price, rating } = req.body;

  const newTour = new Tour({
    name,
    rating,
    price,
  });

  try {
    const tour = await newTour.save();
    return res.status(201).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.getTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((t) => t.id === parseInt(id));

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, duration_days } = req.body;
  const tour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = parseInt(req.params.id);

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

exports.checkBody = (req, res, next) => {
  const { name, price, rating } = req.body;

  if (!name || !price || !rating) {
    return res.status(404).json({
      status: "fail",
      message: "Something missing from name, price, rating of tour",
    });
  }

  next();
};

// Param middleware, it only runs for the Id related routes and check the ID
// exports.checkID = (req, res, next, val) => {
//   console.log("tour id is:", val);
//   const tour = tours.find((t) => t.id === parseInt(val));

//   if (!tour) {
//     return res.status(404).json({
//       status: "fail",
//       message: `Tour with ID: ${val} is not found!`,
//     });
//   }

//   next();
// };
