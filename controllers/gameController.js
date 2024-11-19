exports.newRoom = (req, res, next) => {
  console.log(req.body);
  res.status(200).json({ status: "success", data: "new room made" });
};

exports.joinRoom = (req, res, next) => {
  console.log(req.body);
  res.status(200).json({ status: "success", data: "joined room" });
};
