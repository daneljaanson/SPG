"use strict";

import { createRoom, rejoinRoom } from "./lobby.js";
import { initSource } from "./eventSources.js";
import { startGame, sendComment, updateWord } from "./game.js";
import { drawingHandlers } from "./drawing.js";
import { disableBtnFor } from "./utilities.js";
import { getRoomAndPlayer } from "./utilities.js";

// Buttons
const createBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");
const rcBtn = document.querySelector(".btn--reconnect-room");
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

//Spans
const nameCounterEl = document.querySelector(".intro__input--name-counter");

//////////////////////////////////////////////////////////////
/// VARIABLES
const maxNameLen = 15;

//////////////////////////////////////////////////////////////
/// INTRO

// Code input empty
codeInput.value = "";

// Add input validator for the name
nameCounterEl.textContent = maxNameLen - nameInput.value.length;
nameInput.addEventListener("input", (e) => {
  const nameLen = nameInput.value.length;
  // Change counter text if not over max (or else returns -1)
  if (nameLen <= maxNameLen) nameCounterEl.textContent = maxNameLen - nameLen;
  // Insert max name when name to long
  if (nameLen > maxNameLen)
    nameInput.value = nameInput.value.slice(0, maxNameLen);
});

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
  if (nameInput.value) {
    disableBtnFor(1, joinBtn);
    let code;
    if (codeInput.value) code = codeInput.value;
    if (!codeInput.value) code = "error";
    const success = await createRoom(code);
    if (success) initSource();
  }
});

// Reconnect button handler
rcBtn.addEventListener("click", async (e) => {
  disableBtnFor(1, rcBtn);
  const [code, id] = getRoomAndPlayer();
  const success = await rejoinRoom(code, id);
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
  if (nameInput.value && codeLabel.textContent) {
    disableBtnFor(1, joinBtn);
    const success = await createRoom(codeLabel.textContent);
    if (success) initSource();
  }
});
