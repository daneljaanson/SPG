"use strict";

import { getRoomAndPlayer } from "./utilities.js";

// Painting screen
const drwScreenPicture = document.querySelector("#drwScreenPicture");
const drwScreenLabel = document.querySelector(".drwScreen__picture--role");
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
  const [code, id] = getRoomAndPlayer();
  const body = JSON.stringify({
    comment: commentInput.value,
  });
  // Empty the input
  commentInput.value = "";
  // Send comment to server
  const response = await fetch(`/comment/${code}/${id}`, {
    method: "POST",
    credentials: "include",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
  if (response.status !== 200)
    return showAlert("error", `Error: Comment could not be sent`);
};
