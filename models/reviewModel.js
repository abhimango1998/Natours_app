const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review text is required"],
    },
    rating: {
      type: Number,
      required: [true, "Review rating is required"],
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: "user",
  //     select: "name photo",
  //   }).populate({
  //     path: "tour",
  //     select: "name",
  //   });

  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log("----this----", this); // Model { Review }
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        noOfRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].noOfRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Calc avg rating at new creation, not on update or delete
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate, findByIdAndDelete both works by the query findOne behind the scenes
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Clone the query to avoid re-execution error
  this.rev = await this.clone().findOne();
  next();
});

// Calc avg rating on update and delete.
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does not work here, because query has already executed
  if (this.rev) {
    await this.rev.constructor.calcAverageRatings(this.rev.tour);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
