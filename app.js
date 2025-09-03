const express = require("express");
const morgan = require("morgan");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");

const app = express();

// GLOBAL MIDDLEWARES
// Set security HTTP Headers
app.use(helmet());

// 3rd party middleware, for development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// this limiter is a middleware function, it limits requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from an IP, please try in an hour!",
});
app.use("/api", limiter);

// Middleware to parse JSON bodies, and then makes available in req.body
app.use(express.json({ limit: "10kb" }));

// Middlewares for --> Data sanitization
// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// Middleware to server static file
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Handling unhandle routes error
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
