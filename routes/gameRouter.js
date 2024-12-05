const express = require("express");
const gameController = require("../controllers/gameController");
const viewController = require("../controllers/viewController");

const router = express.Router();

// intro
router.route("/").get(viewController.intro).post(gameController.joinRoom);
router.route("/join/:code").post(gameController.joinRoom);

//lobby
router.route("/lobbySSE/:code/:playerId").get(gameController.lobbySSE);

//game
router.route("/play/:code").get(gameController.startGame);
router.route("/comment/:code/:playerId").post(gameController.sendComment);
router.route("/xy/:code/:x/:y").post(gameController.sendCoords);
router.route("/pictureSSE/:code/:playerId").get(gameController.pictureSSE);
router.route("/commentSSE/:code/:playerId").get(gameController.commentSSE);

module.exports = router;
