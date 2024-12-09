"use strict";
const nodeUtilities = require("../utils/nodeUtilities.js");
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
      // Set new word
      this.assignWords();
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

  // pickNewDrawer() {
  //   // List of players with the lowest score
  //   // Returns [[playerId, timesDrawn], [...] ] ascending
  //   const allPlayers = Object.values(this.players)
  //     .map((playerObj) => [playerObj.id, playerObj.timesDrawn])
  //     .sort((a, b) => {
  //       b[1] - a[1];
  //     });
  //   console.log("allplayers ", allPlayers);
  //   // Pick out players who have drawn the least
  //   const drawers = allPlayers.filter((arr) => arr[1] === allPlayers[0][1]);
  //   console.log("lowest wins players", drawers);

  //   // Choose a random player
  //   const drawerId = drawers[Math.trunc(Math.random() * drawers.length)][0];
  //   this.players[drawerId].timesDrawn += 1;
  //   this.players[drawerId].isDrawing = true;

  //   return;
  // }

  // Generate new words for all players
  assignWords() {
    Object.values(this.players).forEach((playerObj) => {
      playerObj.word = AppState.randomWord();
    });
  }

  // Assign a word to the specific player and send it to them
  assignSendWord(playerId) {
    this.players[playerId].word = AppState.randomWord();
    this.stateSSEResponses[playerId].write(
      `data: ${JSON.stringify({
        status: "new-word",
        word: this.players[playerId].word,
      })}\n\n`
    );
  }

  sendWord(playerId) {}

  sendRoundStart() {
    // Top players for score keeping
    const players = this.getTopPlayers(3);
    console.log(players);

    // Send to all players
    for (const [playerId, playerObj] of Object.entries(this.players)) {
      // Send data to all
      const data = {
        status: this.gameState,
        players,
        word: playerObj.word,
      };
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

  // Check if comment is answer and send it to all
  checkSendComment(guesserCommenterId, comment) {
    const commentLower = comment.toLowerCase();
    let isCorrect = false;
    // Send response with status "correct-guess" and drawer's id (to delete image)
    let status = "comment received";
    let drawerId = "";
    let players = [];
    // Winner names to display winners in client
    const winnerNames = [];
    for (const [playerId, playerObj] of Object.entries(this.players)) {
      // if guess matches, give point to guesser and drawer
      //&& playerId !== guesserCommenterId
      if (playerObj.word === commentLower) {
        this.players[playerId].points++;
        this.players[guesserCommenterId].points++;
        isCorrect = true;
        drawerId = nodeUtilities.publicId(playerId);
        winnerNames.push(this.players[playerId].name);
        this.assignSendWord(playerId);
      }
    }
    // Also add guesser
    if (isCorrect) {
      winnerNames.push(this.players[guesserCommenterId].name);
      status = "correct-guess";
      players = this.getTopPlayers(3);
    }

    Object.values(this.commentSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          status,
          players,
          drawerId,
          winnerNames,
          comment,
          name: this.players[guesserCommenterId].name,
        })}\n\n`
      );
    });
  }

  // Send public ids with painting strokes ( to differentiate between paintings )
  sendCoordinates(drawerId, stroke) {
    const id = this.players[drawerId].publicId;
    Object.values(this.pictureSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          id,
          stroke,
        })}\n\n`
      );
    });
    for (const [playerId, playerRes] of Object.entries(
      this.pictureSSEResponses
    )) {
      playerRes.write(
        `data: ${JSON.stringify({
          id,
          stroke,
        })}\n\n`
      );
    }
  }
}

module.exports = GameState;
