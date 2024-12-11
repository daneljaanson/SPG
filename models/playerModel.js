"use strict";

const nodeUtilities = require("../utils/nodeUtilities.js");

class Player {
  constructor(name) {
    this.name = name;
    this.points = 0;
    this.word = "";
    this.id = nodeUtilities.randNPlaceInt(process.env.PLAYER_ID_LENGTH);
    this.publicId = nodeUtilities.publicId(this.id);
  }
}

module.exports = Player;
