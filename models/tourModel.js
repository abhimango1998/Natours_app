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
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be less or equal to 5.0"],
      set: (val) => Math.round(val * 10) / 10, // rounds to 1 decimal
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // startLoaction is not schema type, it is an embeded object
    startLocation: {
      // mongoDB uses GeoJSON in order to specify geospatial data
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // coordinates of point consist longitude first, longitude second
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); // <-- Indexing
tourSchema.index({ price: 1, ratingsAverage: -1 }); // <-- Compound indexing
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual("reviews", {
  ref: "Review", // name of model which i want to reference
  //Below: Specifying the name of the fields in order to connect to data sets
  foreignField: "tour", // name of the field in other model (Review in this case which has tour field)
  localField: "_id", // where is the id stored, here in this current model (Tour)
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

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query takes ${Date.now() - this.start} milliseconds...`);
  next();
});

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log("agg this:", this.pipeline());
//   next();
// });

// creating model from above mongoose schema
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
