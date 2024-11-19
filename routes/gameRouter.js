const express = require("express");
const gameController = require("../controllers/gameController");
const viewController = require("../controllers/viewController");
const secController = require("../controllers/secController");

const router = express.Router();

router
  .route("/")
  .get(viewController.intro)
  .post(secController.protect, gameController.newRoom);
router.route("/:code").post(secController.protect, gameController.joinRoom);

module.exports = router;
