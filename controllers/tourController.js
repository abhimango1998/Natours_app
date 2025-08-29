const Tour = require("../models/tourModel");

exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "success",
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Another way to create tour
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: "fail",
      message: "Invalid Data Set!",
    });
  }
};

// exports.createTour = async (req, res) => {
//   const { name, price, rating } = req.body;

// const newTour = new Tour({
//   name,
//   rating,
//   price,
// });

//   try {
// const tour = await newTour.save();
//     return res.status(201).json({
//       status: "success",
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// };

exports.getTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findById(id);
    // Tour.findOne({_id: id}) --> findById is shorthand for this

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: "success",
      message: "Tour deleted Successfully!",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// exports.checkBody = (req, res, next) => {
//   const { name, price, rating } = req.body;

//   if (!name || !price || !rating) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Something missing from name, price, rating of tour",
//     });
//   }

//   next();
// };
