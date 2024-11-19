exports.intro = (req, res, next) =>
  res.status(200).render("base", {
    status: "success",
    data: "S. D. G.",
  });
