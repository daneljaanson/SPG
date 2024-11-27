"use strict";

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

// Disable button, move to room screen, send request to make room / establish lobby SSE
export const createRoom = async function (code = "") {
  //////////////////////////////////
  // Send room start to server
  const body = JSON.stringify({
    name: nameInput.value,
  });

  const response = await fetch(`http://127.0.0.1:3000/${code ? code : ""}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });

  if (response.status !== 201 && response.status !== 200)
    return "error", response;

  //////////////////////////////////
  // Get room and player states
  const json = await response.json();

  // Add room key to HTML
  codeLabel.textContent = json.data.code;

  // Hide loader
  loader.style.opacity = 0;
  setTimeout(() => {
    loader.style.display = "none";
  }, 5000);

  // Show lobby
  lobbyContainer.style.opacity = 1;
  lobbyContainer.style.userSelect = "auto";
};
