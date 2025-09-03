// This file is responsible to import and delete data in database only

const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

// const filePath = `${__dirname}/data/tours-simple.json`;
const filePath = `${__dirname}/data/tours.json`;

const toursJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));

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
    console.log("Tours data imported successfylly!");
  } catch (error) {
    console.log("Error while importing data:", error.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Tours data deleted successfylly!");
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
