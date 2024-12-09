"use strict";

const nodeUtilities = require("../utils/nodeUtilities.js");

class Player {
  constructor(name) {
    const maxName = 10 ** (process.env.PLAYER_ID_LENGTH - 1);
    this.name = name;
    this.points = 0;
    this.word = "";
    this.isDrawing = false;
    this.timesDrawn = 0;
    this.id = nodeUtilities.randNPlaceInt(process.env.PLAYER_ID_LENGTH);
    this.publicId = nodeUtilities.publicId(this.id);
    console.log("player");
  }
}

module.exports = Player;
