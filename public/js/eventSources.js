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

export const initSource = function () {
  // Actively update player count
  // Send room code and player id

  const eventSource = new EventSource(`/lobbySSE/`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("lobby status", data.status);
    if (data.status === "open") {
      const playerNames = data.data;
      // Add player name to ul
      playerListEl.innerHTML = "";
      playerNames.forEach((name) => {
        playerListEl.innerHTML += `<li>${name}</li>`;
      });
      // On game start, start gameSSE
    } else if (data.status === "init") {
      // Move to the room screen
      introScreen.style.transform = "translateX(-100%)";
      roomScreen.style.transform = "translateX(0)";
    } else if (data.status === "start") {
      const gameEventSource = gameSources();
      return setTimeout(() => {
        eventSource.close();
        console.log("lobby source closed");
      }, 5000);
    }
  };

  eventSource.onerror = (error) => {
    console.log("Lobby SSE error", error);
    eventSource.close();
  };
};

const gameSources = function () {
  const eventSorucePicture = pictureSource();
  const eventSoruceComment = commentSource();

  // Move to game screen
  roomScreen.style.transform = "translateX(-100%)";
  gameScreen.style.transform = "translateX(0)";
};

// Display new coordinates
const pictureSource = () => {
  const eventSource = new EventSource(`/pictureSSE/`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("new coord", data.newcoord);
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
  const eventSource = new EventSource(`/commentSSE/`);

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
