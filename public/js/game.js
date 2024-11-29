"use strict";

// Forms
const commentForm = document.querySelector(".game__info--form");

// Inputs
const commentInput = document.querySelector("#comment");

// Prevent refresh
commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

export const startGame = async () => {
  // Send start signal to server
  const response = await fetch(`http://127.0.0.1:3000/play`);
  if (response.status !== 200) return "error", response;
};

export const sendComment = async () => {
  const body = JSON.stringify({
    comment: commentInput.value,
  });
  // Send comment to server
  const response = await fetch(`http://127.0.0.1:3000/comment`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });

  const json = await response.json();

  // TODO when error, display error to player
};
// TODO Add all game buttons and display
export const buildGameHtml = () => {};
