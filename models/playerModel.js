"use strict";

class Player {
  constructor(name) {
    this.name = name;
    this.points = 0;
    this.isDrawing = false;
    this.timesDrawn = 0;
    this.id = Math.trunc(
      Math.random() * (9999999999 - 1000000000) + 1000000000
    );
  }
}

module.exports = Player;
