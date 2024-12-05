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
// Buttons
const createBtn = document.querySelector(".btn--create-room");

////////////////////////////
// CODE
////////////////////////////

// Prevent refresh
introForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Send request to make room / establish lobby SSE, show lobby
export const createRoom = async function (code = "") {
  //////////////////////////////////
  // Send room start to server
  const body = JSON.stringify({
    name: nameInput.value,
  });
  const response = await fetch(`/${code ? "join/" + code : ""}`, {
    method: "POST",
    body,
    headers: {
      "Content-type": "application/json",
    },
  });
  createBtn.style.backgroundColor = "red";

  if (response.status !== 201 && response.status !== 200)
    return "error", response;

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
};
