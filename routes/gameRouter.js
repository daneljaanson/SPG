const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

router.route("/").get(gameController.newRoom);
router.route("/:code").get(gameController.joinRoom);

module.exports = router;
