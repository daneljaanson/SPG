"use strict";

import { createRoom, startGame } from "./lobby.js";

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
createBtn.addEventListener("click", (e) => {
  if (nameInput.value) {
    createRoom();
  }
});

// Join game button handler
joinBtn.addEventListener("click", (e) => {
  if (nameInput.value && codeInput.value) {
    createRoom(codeInput.value);
  }
});

//////////////////////////////////////////////////////////////
/// ROOM

startBtn.addEventListener("click", (e) => {
  if (nameInput.value && codeInput.value) {
    startGame();
  }
});

//////////////////////////////////////////////////////////////
/// GAME

//////////////////////////////////////////////////////////////
/// ROUND-END

//////////////////////////////////////////////////////////////
/// GAME-END
