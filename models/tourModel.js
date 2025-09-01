const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour name is required!"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A tour name must have less than of equal to 40 characters",
      ],
      minlength: [10, "A tour name must have greater than 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "challenging", "moderate", "hard"],
        message: "Difficulty is either: eays, challenging, moderate, hard",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be less or equal to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour Price is required!"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Here this only points to current doc on NEW document creation
          return val < this.price;
        },
        message:
          "Discount price ({VALUE}) should be less than the acutal price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document middleware: runs before .save() and .create() but not for insertMany();
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post("save", function (doc, next) {
//   console.log("doccc----", doc);
//   next();
// });

// QUERY MIDDLEWARE
// only runs for find
tourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } });
  // setting new property on this
  this.start = Date.now();
  next();
});

// above also runs for findOne, findOneAndDelete etc
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now(); // setting new property on this
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query takes ${Date.now() - this.start} milliseconds...`);
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log("agg this:", this.pipeline());
  next();
});

// creating model from above mongoose schema
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
