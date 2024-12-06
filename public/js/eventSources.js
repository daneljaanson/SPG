"use strict";

import { getRoomAndPlayer } from "./utilities.js";

// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");
const gameScreen = document.querySelector(".container--game");

// Lists
const playerListEl = document.querySelector(".room__player-list");
const commentListEl = document.querySelector(".game__info--comment-list");

// Labels
const roleLabel = document.querySelector(".game__role");

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
      playerListEl.innerHTML = "";
      playerNames.forEach((name) => {
        playerListEl.innerHTML += `<li>${name}</li>`;
      });
      // Move to the room screen
    } else if (data.status === "init") {
      introScreen.style.transform = "translateX(-100%)";
      roomScreen.style.transform = "translateX(0)";
      // On game start, start gameSSE
    } else if (data.status === "start") {
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

const gameSources = function () {
  const eventSourcePicture = pictureSource();
  const eventSourceComment = commentSource();

  // Move to game screen
  roomScreen.style.transform = "translateX(-100%)";
  gameScreen.style.transform = "translateX(0)";

  return { picture: eventSourcePicture, comment: eventSourceComment };
};

// Display new coordinates
const pictureSource = () => {
  const [code, id] = getRoomAndPlayer();
  const eventSource = new EventSource(`/pictureSSE/${code}/${id}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // TODO display coords
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
    const commenterName = data.name ? `<strong>${data.name}:</strong>` : "";
    commentListEl.innerHTML += `<li>${commenterName} ${data.comment}</li>`;
    commentListEl.lastChild.scrollIntoView({ behavior: "smooth" });
    // commentListEl.scrollTop = commentListEl.scrollHeight;
  };

  eventSource.onerror = (error) => {
    console.log("Comment SSE error", error);
    eventSource.close();
  };
  return eventSource;
};
