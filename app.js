const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(express.static(`${__dirname}/public`));

// 3rd party middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware to parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Handling un handle routers error
// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Can't find ${req.originalUrl} on this server`,
//   });
// });

// app.all("*", (req, res, next) => {
//   const err = new Error(`Can't find ${req.originalUrl} on this server`);
//   err.status = "fail";
//   err.statusCode = 404;

//   next(err);
// });

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
