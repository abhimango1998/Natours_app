class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // what ever we pass into Error class that becomes the message property.

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
