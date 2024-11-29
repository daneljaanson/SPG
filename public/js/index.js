"use strict";

import { createRoom } from "./lobby.js";
import { initSource } from "./eventSources.js";
import { startGame, sendComment } from "./game.js";

// Buttons
const createBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");
const startBtn = document.querySelector(".btn--start-game");
const commentBtn = document.querySelector(".game__info--btn");

//Inputs
const nameInput = document.querySelector("#name");
const codeInput = document.querySelector("#code");
const commentInput = document.querySelector("#comment");

//////////////////////////////////////////////////////////////
/// INTRO

// Start game button handler
createBtn.addEventListener("click", async (e) => {
  if (nameInput.value) {
    await createRoom();
    initSource();
  }
});

// Join game button handler
joinBtn.addEventListener("click", async (e) => {
  if (nameInput.value && codeInput.value) {
    await createRoom(codeInput.value);
    initSource();
  }
});

//////////////////////////////////////////////////////////////
/// ROOM

startBtn.addEventListener("click", (e) => {
  startGame();
});

//////////////////////////////////////////////////////////////
/// GAME

// Post comment button handler
commentBtn.addEventListener("click", async (e) => {
  if (commentInput.value) {
    sendComment();
  }
});

//////////////////////////////////////////////////////////////
/// ROUND-END

//////////////////////////////////////////////////////////////
/// GAME-END
