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
    this.stateSSEResponses = {};
    this.currentWord = "";
    this.gameState = "lobby";
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);
  }

  startGameSSE() {
    this.writeLobby("game-start");
  }

  startGame() {
    if (this.gameState === "lobby" || this.gameState === "game-end")
      this.setState("game-start");
  }

  setState(stateName) {
    // Initialize game
    if (stateName === "game-start") {
      this.gameState = stateName;
      // Send message to players that game started
      // TODO WAIT FOR EVERYONE TO CONNECT
      // siin probleem, setstate ei saa ligi kuna ssed pole kohal

      // Set points to 0
      Object.values(this.players).forEach((playerObj) => {
        playerObj.points = 0;
        playerObj.timesDrawn = 0;
      });
      // Start round
      this.setState("round-start");
      return;
    }
    // Start round
    if (stateName === "round-start") {
      this.gameState = stateName;
      // Choose drawer
      this.pickNewDrawer();
      // Set new word
      this.currentWord = AppState.randomWord();
      // Send start to players
      this.sendRoundStart();
      return;
    }
    // End round
    if (stateName === "round-end") {
      this.gameState = stateName;
      // Set all drawers to false
      Object.values(this.players).forEach(
        (playerObj) => (playerObj.isDrawing = false)
      );
      return;
    }
    // Game end
    if (stateName === "game-end") {
      this.gameState = stateName;
      return;
    }
  }

  pickNewDrawer() {
    // List of players with the lowest score
    // Returns [[playerId, timesDrawn], [...] ] ascending
    const allPlayers = Object.values(this.players)
      .map((playerObj) => [playerObj.id, playerObj.timesDrawn])
      .sort((a, b) => {
        b[1] - a[1];
      });
    console.log("allplayers ", allPlayers);
    // Pick out players who have drawn the least
    const drawers = allPlayers.filter((arr) => arr[1] === allPlayers[0][1]);
    console.log("lowest wins players", drawers);

    // Choose a random player
    const drawerId = drawers[Math.trunc(Math.random() * drawers.length)][0];
    this.players[drawerId].timesDrawn += 1;
    this.players[drawerId].isDrawing = true;

    return;
  }

  sendRoundStart() {
    // Top players for score keeping
    const players = this.getTopPlayers(3);
    console.log(players);

    // Send to all players
    for (const [playerId, playerObj] of Object.entries(this.players)) {
      // Role for player
      const role = playerObj.isDrawing ? "Drawistador" : "La Guesserinio";
      // Text for info based on role
      let text;
      if (playerObj.isDrawing) text = `Draw: ${this.currentWord}`;
      if (!playerObj.isDrawing) text = `Guess the drawing!`;
      // Send data to all
      const data = {
        status: this.gameState,
        players,
        role,
        text,
      };
      console.log("in sendroundstart", playerId);
      this.stateSSEResponses[playerId].write(
        `data: ${JSON.stringify(data)}\n\n`
      );
    }
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

  // Return array [[playerName, points], [...] ] descending
  getTopPlayers(n) {
    const topPlayers = Object.values(this.players)
      .map((playerObj) => [playerObj.name, playerObj.points])
      .sort((a, b) => {
        b[1] - a[1];
      });

    if (n) return topPlayers.slice(0, n);
    return topPlayers.slice();
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
    });
  }

  sendCoordinates(drawerId, stroke) {
    for (const [playerId, playerRes] of Object.entries(
      this.pictureSSEResponses
    )) {
      if (playerId !== drawerId)
        playerRes.write(
          `data: ${JSON.stringify({
            stroke,
          })}\n\n`
        );
    }
  }
}

module.exports = GameState;
