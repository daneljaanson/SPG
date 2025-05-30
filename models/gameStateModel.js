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
    this.scoreLimit = 4;
    // add room to rooms list and get key
    this.roomKey = AppState.newRoom(this);
  }

  // Let front-end know that other SSE connections must now be established
  // This happens when START GAME button is pressed
  startGameSSE() {
    this.writeLobby("game-start");
  }

  setState(stateName) {
    // Room
    if (stateName === "lobby") {
      this.gameState = stateName;
      return;
    }
    // Initialize game
    if (stateName === "game-start") {
      if (this.gameState !== "lobby" && this.gameState !== "game-end")
        return false;

      this.gameState = stateName;
      // Send message to players that game started
      // TODO WAIT FOR EVERYONE TO CONNECT
      // siin probleem, setstate ei saa ligi kuna ssed pole kohal

      // Set points to 0
      Object.values(this.players).forEach((playerObj) => {
        playerObj.points = 0;
      });
      // Start round
      this.setState("round-start");
      return true;
    }
    // Start round
    if (stateName === "round-start") {
      this.gameState = stateName;
      // Set new word
      this.assignWords();
      // Send start to players
      this._sendRoundStart();
      return true;
    }
    // End round
    if (stateName === "round-end") {
      this.gameState = stateName;
      this._sendRoundEnd();
      // End all SSEs
      this.closeAllSSE();
      // Remove all players
      this.players = {};
      return true;
    }
  }

  // Send close signals to all and then remove them from state
  closeAllSSE(s = 0) {
    setTimeout(() => {
      [
        this.lobbySSEResponses,
        this.pictureSSEResponses,
        this.commentSSEResponses,
        this.stateSSEResponses,
      ].forEach((SSEObj) => {
        Object.values(SSEObj).forEach((sse) => {
          sse.write(
            `data: ${JSON.stringify({
              status: "close",
            })}\n\n`
          );
        });
      });

      this.lobbySSEResponses = {};
      this.pictureSSEResponses = {};
      this.commentSSEResponses = {};
      this.stateSSEResponses = {};
    }, s * 1000);
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
        id: nodeUtilities.publicId(playerId),
      })}\n\n`
    );
  }

  _sendRoundStart() {
    // Top players for score keeping
    const players = this.getTopPlayers(3);

    // Send to all players
    for (const [playerId, playerObj] of Object.entries(this.players)) {
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

  _sendRoundEnd() {
    // Send game end signal and data to players
    Object.values(this.stateSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          status: "round-end",
          players: this.getTopPlayers(),
        })}\n\n`
      );
    });
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

  // Make list of player Ids
  getPlayerIds() {
    return Object.keys(this.players);
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

  // If added score hits limit, return true
  _addCheckScore(...playerIds) {
    let limitReached = false;
    // Add score to players
    playerIds.forEach((playerId) => {
      this.players[playerId].points++;
      if (this.players[playerId].points >= this.scoreLimit) limitReached = true;
    });
    if (!limitReached) return false;
    return true;
  }
  // Check if comment is answer and send it to all
  checkSendComment(guesserCommenterId, comment) {
    // Variables
    const commentLower = comment.toLowerCase();
    // Send response with status "correct-guess" and drawer's id (to delete image)
    let status = "comment received";
    let players = [];
    // Winner names to display winners in client
    const winners = { guesser: "", drawer: "", drawerId: "", word: "" };
    let isWin = false;

    // Find if guessed word matches a player's word
    for (const [playerId, playerObj] of Object.entries(this.players)) {
      // if guess matches, give point to guesser and drawer
      // TODO add later vvvvvvvvvvv
      //&& playerId !== guesserCommenterId
      if (playerObj.word === commentLower) {
        winners.guesser = this.players[guesserCommenterId].name;
        winners.drawer = this.players[playerId].name;
        winners.drawerId = nodeUtilities.publicId(playerId);
        winners.word = this.players[playerId].word;
        status = "correct-guess";
        // Check if the game is won
        isWin = this._addCheckScore(playerId, guesserCommenterId);
        // If game isnt won, send a new word to the drawer
        if (!isWin) this.assignSendWord(playerId);
        break;
      }
    }
    players = this.getTopPlayers(3);
    // Send either regular comment or winners
    Object.values(this.commentSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          status,
          players,
          winners,
          comment,
          name: this.players[guesserCommenterId].name,
        })}\n\n`
      );
    });

    // RESET GAME TO ROUND START
    if (isWin) this.setState("round-end");
  }

  // Send public ids with painting strokes ( to differentiate between paintings )
  sendCoordinates(drawerId, strokeObj) {
    const id = this.players[drawerId].publicId;
    Object.values(this.pictureSSEResponses).forEach((playerRes) => {
      playerRes.write(
        `data: ${JSON.stringify({
          id,
          strokeObj,
        })}\n\n`
      );
    });
  }
}

module.exports = GameState;
