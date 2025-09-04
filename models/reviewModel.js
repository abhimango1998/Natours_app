const mongoose = require("mongoose");

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

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
