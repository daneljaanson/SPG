const validator = require("validator");
const AppError = require("./appError.js");
const validateColor = require("validate-color").default;

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
    if (key === "coordinates") {
      // Is it an array
      if (!Array.isArray(value)) next(new AppError("🧀 Invalid data.", 403));
      value.forEach((xyCoordsArr) => {
        // Must be arr
        if (!Array.isArray(xyCoordsArr))
          next(new AppError("🧀 Invalid data.", 403));
        // Must be length 2
        if (xyCoordsArr.length !== 2)
          next(new AppError("🧀 Invalid data.", 403));
        // Is every coordinate a number
        xyCoordsArr.forEach((xy) => {
          if (typeof xy !== "number")
            next(new AppError("🧀 Invalid data.", 403));
        });
      });
      continue;
    }
    if (key === "options") {
      // Check if object is an object not an array of length 2
      if (typeof value !== "object" || Array.isArray(value) || !value)
        next(new AppError("🧀 Invalid data.", 403));
      // Check options
      for (const [optionKey, optionValue] of Object.entries(value)) {
        // Can only have these 2 keys
        if (optionKey !== "lineWidth" && optionKey !== "strokeStyle")
          next(new AppError("🧀 Invalid data.", 403));
        // Check if value is a number
        if (optionKey === "lineWidth") {
          if (typeof optionValue !== "number")
            next(new AppError("🧀 Invalid data.", 403));
        }
        // Check if value is either only letters or rgb
        if (optionKey === "strokeStyle") {
          if (
            !validateColor(optionValue) &&
            optionValue !== "white" &&
            optionValue !== "black"
          )
            next(new AppError("🧀 Invalid data.", 403));
        }
      }
      continue;
    }
    console.log(key);
    console.log(value);
    if (key === "comment") {
      if (typeof value !== "string")
        next(new AppError("🧀 Invalid data.", 403));
      const revisedComment = req.body[key]
        .replace(/\{/g, "")
        .replace(/\}/g, "")
        .replace(/\(/g, "")
        .replace(/\)/g, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "");
      console.log(revisedComment);
      req.body[key] = revisedComment;
      console.log(req.body[key]);
      continue;
    }
    // Reject all undefined keys
    next(new AppError("Invalid data", 403));
  }
  next();
};
