"use strict";

const AppState = require("./appStateModel");
const EventEmitter = require("events");

////////////////////////
// Emit functions

////////////////////////
// Game state
class GameState {
  constructor() {
    // Players object keys are player IDs (player.id)
    this.players = {};
    this.lobbySSEResponses = {};
    this.gameSSEResponses = {};
    this.gameState = "lobby";
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);

    // Emitter for game events
    this.gameEmitter = new EventEmitter();

    // On game start, send event to all players
    // this.gameEmitter.on("gameStart", () => emitterController.sendStart());
  }

  addPlayer(Player) {
    // Add player to player list
    this.players[Player.id] = Player;
  }

  removePlayer(Player) {}

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

  // closeLobby() {
  //   Object.values(this.lobbySSEResponses).forEach((playerRes) => {
  //     playerRes.end();
  //   });
  // }
}

module.exports = GameState;
