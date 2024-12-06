class AppError extends Error {
  constructor(message, statusCode, redirect = false) {
    super(message);
    this.statusCode = statusCode;
    this.status = "error";
    this.redirect = redirect;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
