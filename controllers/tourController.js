const Tour = require("../models/tourModel");

exports.getTop5CheapestTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTours = async (req, res) => {
  // BUILD QUERY
  // 1A) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ["page", "limit", "sort", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // 1B) Advanced Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Tour.find(JSON.parse(queryStr));

  // 2) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // 3) Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 3) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  try {
    if (req.query.page) {
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) throw new Error("This page doesn't exists");
    }

    const tours = await query;
    res.status(200).json({
      status: "success",
      results: tours.length,
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
