"use strict";

const AppState = require("./appStateModel");

const _sendPlayerUpdate = () => {};

class GameState {
  constructor() {
    // Players object keys are player IDs (player.id)
    this.players = {};
    this.gameState = "lobby";
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);
  }

  addPlayer(Player) {
    // Add player to player list
    this.players[Player.id] = Player;
  }

  removePlayer(Player) {}

  // Make list of player names
  getPlayerList() {
    const playerList = Object.values(this.players).map((playerObj) => {
      // console.log(playerObj.name);
      return playerObj.name;
    });
    // console.log(playerList);
    return playerList;
  }
}

module.exports = GameState;
