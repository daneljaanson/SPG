const express = require("express");
const gameController = require("../controllers/gameController");
const viewController = require("../controllers/viewController");

const router = express.Router();

// intro
router.route("/").get(viewController.intro).post(gameController.joinRoom);
router.route("/join/:code").post(gameController.joinRoom);

//lobby
router.route("/lobbySSE/").get(gameController.lobbySSE);

//game
router.route("/play/").get(gameController.startGame);
router.route("/comment/").post(gameController.sendComment);
router.route("/pictureSSE/").get(gameController.pictureSSE);
router.route("/commentSSE/").get(gameController.commentSSE);

module.exports = router;
