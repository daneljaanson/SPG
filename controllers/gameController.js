exports.newRoom = (req, res, next) => {
  res.status(200).json({ status: "success", data: "new room made" });
};

exports.joinRoom = (req, res, next) => {
  res.status(200).json({ status: "success", data: "joined room" });
};
