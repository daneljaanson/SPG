"use strict";

const AppState = require("./appStateModel");

const _sendPlayerUpdate = () => {};

class GameState {
  constructor(firstPlayer) {
    this.players = {};
    this.players[firstPlayer.id] = firstPlayer;
    this.gameState = "lobby";
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);
  }

  addPlayer(Player) {
    this.players[Player.id] = Player;
    AppState.printPlayers(this.roomKey);
  }

  removePlayer(Player) {}
}

module.exports = GameState;
