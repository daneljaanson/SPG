// When an error is generated, it is sent here automatically (when error in next())
// Express identifies an error handler by counting FOUR arguments
module.exports = (err, req, res, next) => {
  console.error("🧀🥖 ERROR:", err);
  if (err.redirect) {
    res.status(err.statusCode).render("error", {
      title: "errore",
      msg: err.message,
    });
    return;
  }
  res.status(err.statusCode).json({
    status: "fail",
    data: { message: err.message },
  });
};
