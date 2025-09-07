// This file is responsible to import and delete data in database only
// - Import fresh data command --> node .\dev-data\import-dev-data.js --import
// - Delete all data command --> node .\dev-data\import-dev-data.js --delete

const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");

const toursJson = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, "utf-8"),
);

const reviewsJson = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, "utf-8"),
);

const usersJson = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"),
);

dotenv.config({ path: "./config.env" });

const DBStr = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DBStr)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

// IMPORTING DATA TO DB
const importData = async () => {
  try {
    await Tour.create(toursJson);
    await User.create(usersJson, { validateBeforeSave: false });
    await Review.create(reviewsJson);
    console.log("Whole data imported successfully!");
  } catch (error) {
    console.log("Error while importing data:", error.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Whole data deleted successfully!");
  } catch (error) {
    console.log("Error while deleting data:", error.message);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
