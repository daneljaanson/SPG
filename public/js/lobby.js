"use strict";

////////////////////////////
// ELEMENTS

// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");

// Hidden elements
const lobbyContainer = document.querySelector(".room");
const codeLabel = document.querySelector(".room__code");
const playerList = document.querySelector(".room__player-list");
const loader = document.querySelector(".lds-ellipsis-container");

// Forms
const introForm = document.querySelector(".intro");

// Buttons
const createBtn = document.querySelector(".btn--create-room");
const joinBtn = document.querySelector(".btn--join-room");
const startBtn = document.querySelector(".btn--start-game");

// Inputs
const nameInput = document.querySelector("#name");

////////////////////////////
// CODE

// Prevent refresh
introForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Disable button, move to room screen, send request
export const createRoom = async function (code = "") {
  // Move to the room screen
  introScreen.style.transform = "translateX(-100%)";
  roomScreen.style.transform = "translateX(0)";

  //////////////////////////////////
  // Send room start to server
  const body = JSON.stringify({
    status: code ? "joinRoom" : "createRoom",
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
  codeLabel.textContent = json.data.roomKey;

  // Hide loader
  loader.style.opacity = 0;
  setTimeout(() => {
    loader.style.display = "none";
  }, 5000);

  // Show lobby
  lobbyContainer.style.opacity = 1;
  lobbyContainer.style.userSelect = "auto";

  //////////////////////////////////
  // Establish SSE connection
  // Actively update player count
  // Send room code and player id
  const eventSource = new EventSource(
    `/lobbySSE/${json.data.roomKey}/${json.data.id}`
  );

  eventSource.onmessage = (event) => {
    playerList.innerHTML = "";
    const playerNames = JSON.parse(event.data).data;
    // Add player name to ul
    playerNames.forEach((name) => {
      playerList.innerHTML += `<li>${name}</li>`;
    });
  };

  eventSource.onerror = (error) => {
    console.log("SSE error", error);
    eventSource.close();
  };
};

export const startGame = () => {};
