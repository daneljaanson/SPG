"use strict";

import { createRoom } from "./lobby.js";

// Buttons
const startBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");

//Inputs
const nameInput = document.querySelector("#name");
const codeInput = document.querySelector("#code");

//////////////////////////////////////////////////////////////
/// INTRO

// Start game button handler
startBtn.addEventListener("click", (e) => {
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

//////////////////////////////////////////////////////////////
/// GAME

//////////////////////////////////////////////////////////////
/// ROUND-END

//////////////////////////////////////////////////////////////
/// GAME-END
