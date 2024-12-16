"use strict";

import { createRoom } from "./lobby.js";
import { initSource } from "./eventSources.js";
import { startGame, sendComment, updateWord } from "./game.js";
import { drawingHandlers } from "./drawing.js";
import { disableBtnFor } from "./utilities.js";

// Buttons
const createBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");
const startBtn = document.querySelector(".btn--start-game");
const commentBtn = document.querySelector(".game__info--btn");
const refreshWordBtn = document.querySelector(".game__info--refresh-btn");
const playAgainBtn = document.querySelector(".round-end--btn-again");

//Inputs
const nameInput = document.querySelector("#name");
const codeInput = document.querySelector("#code");
const commentInput = document.querySelector("#comment");

//Labels
const codeLabel = document.querySelector(".room__code");

//////////////////////////////////////////////////////////////
/// INTRO

// Start game button handler
createBtn.addEventListener("click", async (e) => {
  if (nameInput.value) {
    // Disable buttons
    disableBtnFor(10, createBtn);
    const success = await createRoom();
    if (success) initSource();
  }
});

// Join game button handler
joinBtn.addEventListener("click", async (e) => {
  if (nameInput.value && codeInput.value) {
    disableBtnFor(1, joinBtn);
    const success = await createRoom(codeInput.value);
    if (success) initSource();
  }
});

//////////////////////////////////////////////////////////////
/// ROOM

startBtn.addEventListener("click", (e) => {
  disableBtnFor(1, startBtn);
  startGame();
});

//////////////////////////////////////////////////////////////
/// GAME

// Post comment button handler
commentBtn.addEventListener("click", (e) => {
  if (commentInput.value) {
    disableBtnFor(1, commentBtn);
    sendComment();
  }
});

// Drawing handlers
drawingHandlers();

// Word refresh button handler
refreshWordBtn.addEventListener("click", (e) => {
  updateWord();
  // For animation
  refreshWordBtn.classList.add("clicked");
  setTimeout(() => {
    refreshWordBtn.classList.remove("clicked");
  }, 5000);
});

//////////////////////////////////////////////////////////////
/// ROUND-END

playAgainBtn.addEventListener("click", async (e) => {
  if (nameInput.value && codeInput.value) {
    disableBtnFor(1, joinBtn);
    const success = await createRoom(codeLabel.textContent);
    if (success) initSource();
  }
});
