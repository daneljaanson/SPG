const express = require("express");
const gameController = require("../controllers/gameController");
const viewController = require("../controllers/viewController");
const validator = require("../utils/validator");

// To access req.params in validator
const router = express.Router({ mergeParams: true });

// intro
router
  .route("/")
  .get(viewController.intro)
  .post(validator.validate, gameController.joinRoom);

router
  .route("/join/:code")
  .post(validator.validate, gameController.getRoom, gameController.joinRoom);

// lobby
router
  .route("/play/:code/ok")
  .get(gameController.getRoom, gameController.startGame);

// game
router
  .route("/play/:code")
  .get(gameController.getRoom, gameController.startSSE);
router
  .route("/comment/:code/:playerId")
  .post(validator.validate, gameController.getRoom, gameController.sendComment);
router
  .route("/xy/:code/:playerId")
  .post(validator.validate, gameController.getRoom, gameController.sendCoords);
router
  .route("/new-word/:code/:playerId")
  .get(gameController.getRoom, gameController.refreshWord);

// SSE
router
  .route("/lobbySSE/:code/:playerId")
  .get(gameController.getRoom, gameController.lobbySSE);
router
  .route("/pictureSSE/:code/:playerId")
  .get(gameController.getRoom, gameController.pictureSSE);
router
  .route("/commentSSE/:code/:playerId")
  .get(gameController.getRoom, gameController.commentSSE);
router
  .route("/stateSSE/:code/:playerId")
  .get(gameController.getRoom, gameController.stateSSE);

module.exports = router;
