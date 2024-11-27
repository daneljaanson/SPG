"use strict";

import { createRoom } from "./lobby.js";
import { lobbySource } from "./eventSources.js";
import { startGame, buildGameHtml } from "./game.js";

// Buttons
const createBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");
const startBtn = document.querySelector(".btn--start-game");

//Inputs
const nameInput = document.querySelector("#name");
const codeInput = document.querySelector("#code");

//////////////////////////////////////////////////////////////
/// INTRO

// Start game button handler
createBtn.addEventListener("click", async (e) => {
  if (nameInput.value) {
    await createRoom();
    lobbySource();
  }
});

// Join game button handler
joinBtn.addEventListener("click", async (e) => {
  if (nameInput.value && codeInput.value) {
    await createRoom(codeInput.value);
    lobbySource();
  }
});

//////////////////////////////////////////////////////////////
/// ROOM

startBtn.addEventListener("click", (e) => {
  startGame();
});

//////////////////////////////////////////////////////////////
/// GAME

buildGameHtml();

//////////////////////////////////////////////////////////////
/// ROUND-END

//////////////////////////////////////////////////////////////
/// GAME-END
