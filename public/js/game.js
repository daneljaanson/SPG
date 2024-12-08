"use strict";

import { showAlert } from "./alerts.js";
import { getRoomAndPlayer } from "./utilities.js";

// Forms
const commentForm = document.querySelector(".game__info--form");
// Inputs
const commentInput = document.querySelector("#comment");

// Prevent refresh
commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

export const startGame = async () => {
  const [code, _] = getRoomAndPlayer();
  // Send start signal to server
  // 192.168.1.149
  // 127.0.0.1
  const response = await fetch(`/play/${code}`);
  if (response.status !== 200)
    return showAlert("error", `Error: Game could not be started`);
};

export const sendComment = async () => {
  // Create data
  console.log("in send comment");
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
    return showAlert("error", `Error: Comment could not be sent`);
};

export const sendDrawingStroke = async (currentDrawingStroke) => {
  if (!currentDrawingStroke) return;
  // Create data
  const [code, id] = getRoomAndPlayer();
  const body = JSON.stringify({
    stroke: currentDrawingStroke,
  });
  // Empty the input
  commentInput.value = "";
  // Send comment to server
  console.log("in send draw stroke");
  const response = await fetch(`/xy/${code}/${id}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
  if (response.status !== 200)
    return showAlert("error", `Error: Comment could not be sent`);
};

// Send round end signal to server
export const roundEnd = async () => {};
