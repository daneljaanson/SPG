// Excludes max
exports.randInt = (min, max) => {
  return Math.trunc(Math.random() * (max - min) + min);
};

// Returns EX: n = 5 => 12345 (first number always 1 to 9)
exports.randNPlaceInt = (n) => {
  if (n > 0) {
    const maxInt = 10 ** (n - 1);
    return Math.trunc(Math.random() * (maxInt * 10 - 1 - maxInt) + maxInt);
  }
  console.error("in nodeutilities.js, n cannot be 0");
};

// Return id with half cut off
exports.publicId = (id) =>
  Number(String(id).slice(0, Math.trunc(String(id).length / 2)));
