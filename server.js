const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("-----UNCAUGHT EXCEPTION!-----SHUTTING DONW SERVER");
  console.log(err.name, err.message);
  process.exit(1); // craching app is mandatory
});

const app = require("./app");

const DBStr = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DBStr).then(() => console.log("DB connection successful!"));
// .catch((err) => console.error("DB connection error:", err));

const port = process.env.PORT || 8000;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("-----UNHANDLED REJECTION!-----SHUTTING DONW SERVER");
  console.log(err.name, err.message);
  server.close(() => process.exit(1)); // craching app is optional
});
