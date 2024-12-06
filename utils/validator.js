const validator = require("validator");
const AppError = require("./appError.js");

// why do parems not appear when pressing joinRoom, but do when pressing create
exports.validate = (req, res, next) => {
  // Params
  for (const [key, value] of Object.entries(req.params)) {
    if (key === "code") {
      if (!validator.isAlpha(value))
        next(new AppError("🧀 error: invalid room code", 404));
      continue;
    }
    if (key === "playerId") {
      if (!validator.isAlphanumeric(value)) next(new AppError("🧀 error", 403));

      continue;
    }
    if (key === "x" || key === "y") {
      continue;
    }
    // If param name is not defined here, it is not allowed to pass
    next(new AppError("🧀 error: Invalid params", 403));
  }

  // Body
  for (const [key, value] of Object.entries(req.body)) {
    if (key === "name") {
      if (!validator.isAlphanumeric(value))
        next(new AppError("🧀 Name must be letters and numbers", 403));
      if (!validator.isLength(value, { min: 1, max: 15 }))
        next(new AppError("🧀 Name must be shorter than 15 letters", 403));
      continue;
    }
  }
  next();
};
