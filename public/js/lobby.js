"use strict";

// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");

// Forms
const introForm = document.querySelector(".intro");

// Buttons
const startBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");

// Inputs
const nameInput = document.querySelector("#name");

// Prevent refresh
introForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Disable button, move to room screen, send request
export const createRoom = function (code = "") {
  // Disable button to prevent double clicks
  startBtn.disabled = true;
  joinBtn.disabled = true;
  // Move to the room screen
  introScreen.style.transform = "translateX(-100%)";
  roomScreen.style.transform = "translateX(0)";
  // Send room start to server
  const body = JSON.stringify({
    status: code ? "joinRoom" : "createRoom",
    name: nameInput.value,
  });

  fetch(`http://127.0.0.1:3000/${code ? code : ""}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
};
