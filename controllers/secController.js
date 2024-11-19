"use strict";

exports.protect = (req, res, next) => {
  const specialChars = /[^a-zA-Z0-9 ]/g;
  console.log("fix sanitization");
  next();
};
