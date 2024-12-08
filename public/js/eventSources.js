"use strict";

import { getRoomAndPlayer } from "./utilities.js";
import { drawStroke } from "./drawing.js";

// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");
const gameScreen = document.querySelector(".container--game");
const drwScreenPicture = document.querySelector("#drwScreenPicture");

// Lists
const playerListLobbyEl = document.querySelector(".room__player-list");
const playerListGameEl = document.querySelector(".game__info--player-list");
const commentListEl = document.querySelector(".game__info--comment-list");

// Labels
const roleLabelEl = document.querySelector(".drwScreen__picture--role");

// Text
const infoTextEl = document.querySelector(".game__info--info-text");

("use strict");

// Actively update player count
export const initSource = function () {
  // Send room code and player id
  const [code, id] = getRoomAndPlayer();
  const eventSource = new EventSource(`/lobbySSE/${code}/${id}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Add player name to ul
    if (data.status === "open") {
      const playerNames = data.data;
      playerListLobbyEl.innerHTML = "";
      playerNames.forEach((name) => {
        playerListLobbyEl.innerHTML += `<li>${name}</li>`;
      });
      // Move to the room screen
    } else if (data.status === "init") {
      introScreen.style.transform = "translateX(-100%)";
      roomScreen.style.transform = "translateX(0)";
      // On game start, start gameSSE
    } else if (data.status === "game-start") {
      const gameEventSource = gameSources();
      return setTimeout(() => {
        eventSource.close();
      }, 5000);
    }
  };

  eventSource.onerror = (error) => {
    console.log("Lobby SSE error", error);
    eventSource.close();
  };
};

const gameSources = async function () {
  const eventSourcePicture = pictureSource();
  const eventSourceComment = commentSource();
  const eventSourceState = stateSource();

  console.log("preparing to send ok signal");

  // Send confirmation that event sources started
  await fetch(`/play/${getRoomAndPlayer()[0]}/ok`);
  console.log("sent ok signal");

  return {
    picture: eventSourcePicture,
    comment: eventSourceComment,
    state: eventSourceState,
  };
};

// Display new coordinates
const pictureSource = () => {
  const [code, id] = getRoomAndPlayer();
  const eventSource = new EventSource(`/pictureSSE/${code}/${id}`);

  eventSource.onmessage = (event) => {
    console.log("in picturesource", event);
    const data = JSON.parse(event.data);
    //  display coords
    if (data.stroke) drawStroke(data.stroke);
  };

  eventSource.onerror = (error) => {
    console.log("Picture SSE error", error);
    eventSource.close();
  };
  return eventSource;
};

// Display new comments
const commentSource = () => {
  const [code, id] = getRoomAndPlayer();
  const eventSource = new EventSource(`/commentSSE/${code}/${id}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Add new comment to ul
    console.log("commentdata", data);
    const commenterName = data.name ? `<strong>${data.name}:</strong>` : "";
    commentListEl.innerHTML += `<li>${commenterName} ${data.comment}</li>`;
    // commentListEl.lastChild.scrollIntoView({ behavior: "smooth" });
    // commentListEl.scrollTop = commentListEl.scrollHeight;
  };

  eventSource.onerror = (error) => {
    console.log("Comment SSE error", error);
    eventSource.close();
  };
  return eventSource;
};

const stateSource = () => {
  const [code, id] = getRoomAndPlayer();
  const eventSource = new EventSource(`/stateSSE/${code}/${id}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.status === "round-start") {
      console.log(data);

      // Enable game screen
      drwScreenPicture.style.userSelect = "auto";
      drwScreenPicture.style.pointerEvents = "auto";
      // Move to game screen
      roomScreen.style.transform = "translateX(-100%)";
      gameScreen.style.transform = "translateX(0)";

      // Add top players and scores to player list
      playerListGameEl.innerHTML = "";
      data.players.forEach(([name, points]) => {
        playerListGameEl.innerHTML += `<li>${name}<span>${points}</span></li>`;
      });

      // Show role and info
      roleLabelEl.textContent = data.role;
      infoTextEl.textContent = data.text;
      // Start guessing timer
    }
  };

  eventSource.onerror = (error) => {
    console.log("State SSE error", error);
    eventSource.close();
  };
  return eventSource;
};
