const express = require("express");
const gameController = require("../controllers/gameController");
const viewController = require("../controllers/viewController");

const router = express.Router();

// intro
router.route("/").get(viewController.intro).post(gameController.joinRoom);
router.route("/:code").post(gameController.joinRoom);

//lobby
router.route("/lobbySSE/").get(gameController.lobbySSE);

//game
router.route("/play/").get(gameController.startGame);
router.route("/gameSSE/").get(gameController.gameSSE);

//game
// router.route("/drawerSSE").get(gameController.drawerSSE);
// router.route("/guesserSSE").get(gameController.guesserSSE);

module.exports = router;
