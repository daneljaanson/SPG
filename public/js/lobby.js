"use strict";

import { showAlert } from "./alerts.js";
////////////////////////////
// ELEMENTS
////////////////////////////

// Hidden elements
const lobbyContainer = document.querySelector(".room");
const codeLabel = document.querySelector(".room__code");
const loader = document.querySelector(".lds-ellipsis-container");
// Forms
const introForm = document.querySelector(".intro");
// Inputs
const nameInput = document.querySelector("#name");

////////////////////////////
// CODE
////////////////////////////

// Prevent refresh
introForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Send request to make room / establish lobby SSE, show lobby
export const createRoom = async function (code = "") {
  if (code === "error") return showAlert("error", "Enter the room key");
  const codeUpper = code.toUpperCase();
  //////////////////////////////////
  // Send room start to server
  const body = JSON.stringify({
    name: nameInput.value,
  });
  const response = await fetch(`/${codeUpper ? "join/" + codeUpper : ""}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });

  if (response.status === 403 || response.status === 404) {
    const json = await response.json();
    showAlert("error", `Error: ${json.data.message}`);
    return false;
  }

  if (response.status !== 201 && response.status !== 200) {
    showAlert("error", `Status code: ${response.status}`);
    return false;
  }

  //////////////////////////////////
  // Show room code and display lobby
  const json = await response.json();

  // Add room key to HTML
  codeLabel.textContent = json.data.code;
  codeLabel.setAttribute("data-player", json.data.id);

  // Hide loader
  loader.style.opacity = 0;
  setTimeout(() => {
    loader.style.display = "none";
  }, 5000);

  // Show lobby
  lobbyContainer.style.opacity = 1;
  lobbyContainer.style.userSelect = "auto";

  return true;
};
