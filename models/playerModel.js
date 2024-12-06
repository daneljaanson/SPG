"use strict";

class Player {
  constructor(name) {
    const maxName = 10 ** (process.env.PLAYER_ID_LENGTH - 1);
    this.name = name;
    this.points = 0;
    this.isDrawing = false;
    this.timesDrawn = 0;
    this.id = Math.trunc(
      Math.random() * (maxName * 10 - 1 - maxName) + maxName
    );
  }
}

module.exports = Player;
