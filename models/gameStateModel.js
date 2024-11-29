"use strict";

const AppState = require("./appStateModel");

////////////////////////
// Game state
class GameState {
  constructor() {
    // Players object keys are player IDs (player.id)
    this.players = {};
    this.lobbySSEResponses = {};
    this.pictureSSEResponses = {};
    this.commentSSEResponses = {};
    this.gameState = "lobby";
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);
  }

  addPlayer(Player) {
    // Add player to player list
    this.players[Player.id] = Player;
  }

  // Make list of player names
  getPlayerList() {
    const playerList = Object.values(this.players).map((playerObj) => {
      return playerObj.name;
    });
    return playerList;
  }

  writeLobby(status, data = "") {
    Object.values(this.lobbySSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          status,
          data,
        })}\n\n`
      );
    });
  }

  sendComment(playerId, comment) {
    Object.values(this.commentSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          comment,
          name: this.players[playerId].name,
        })}\n\n`
      );
      console.log("sent comment response");
    });
  }
  //TODO writePainting
}

module.exports = GameState;
