"use strict";

import { showAlert } from "./alerts.js";
import { getRoomAndPlayer } from "./utilities.js";

// New word timer
let wordTimer = 0;

// Forms
const commentForm = document.querySelector(".game__info--form");
// Inputs
const commentInput = document.querySelector("#comment");
const svgEl = document.querySelector(".refresh-svg");
// Spans
const refreshCounterSpan = document.querySelector(
  ".game__info--refresh-counter"
);

// Prevent refresh
commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// when START GAME is pressed
export const startGame = async () => {
  const [code, _] = getRoomAndPlayer();
  // Send start signal to server
  // 192.168.1.149
  // 127.0.0.1
  const response = await fetch(`/play/${code}`);
  if (response.status !== 200)
    return showAlert("error", `Game could not be started`);
};

export const sendComment = async () => {
  // Create data
  const [code, id] = getRoomAndPlayer();
  const body = JSON.stringify({
    comment: commentInput.value,
  });
  // Empty the input
  commentInput.value = "";
  // Send comment to server
  const response = await fetch(`/comment/${code}/${id}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
  if (response.status !== 200)
    return showAlert("error", `Comment could not be sent`);

  const json = await response.json();
};

export const sendDrawingStroke = async (currentDrawingStroke, toolOptions) => {
  if (currentDrawingStroke.length === 0) return;
  // Create data
  const [code, id] = getRoomAndPlayer();
  // This is strokeObj
  const body = JSON.stringify({
    coordinates: currentDrawingStroke,
    options: toolOptions,
  });
  // Send comment to server
  const response = await fetch(`/xy/${code}/${id}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
  if (response.status !== 200)
    return showAlert("error", `Coordinates could not be sent`);
};

// Send round end signal to server
export const updateWord = () => {
  if (wordTimer === 0) {
    const [code, id] = getRoomAndPlayer();
    fetch(`/new-word/${code}/${id}`);
    // Set word timer to 5 seconds
    wordTimer = 5;
    refreshCounterSpan.textContent = wordTimer;
    svgEl.style.display = "none";
    const intervalId = window.setInterval(() => {
      wordTimer--;
      refreshCounterSpan.textContent = wordTimer === 0 ? "" : wordTimer;
      if (wordTimer === 0) {
        window.clearInterval(intervalId);
        svgEl.style.display = "block";
      }
    }, 1000);
    return;
  }
  return showAlert("oops", `Wait ${wordTimer} seconds!`);
};
