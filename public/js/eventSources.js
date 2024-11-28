// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");
const gameScreen = document.querySelector(".container--game");

// Lists
const playerListEl = document.querySelector(".room__player-list");

// Labels
const roleLabel = document.querySelector(".game__role");

("use strict");

export const lobbySource = function () {
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
      const gameEventSource = gameSource();
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

export const gameSource = function () {
  const eventSource = new EventSource(`/gameSSE/`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("lobby status", data.status);

    let role;
    // TODO Guesser receives coordinates every moment
    // TODO Drawer draws bunches of coordinates that get assembled into a drawing
    if (data.status === "init") {
      // Move to game screen
      roomScreen.style.transform = "translateX(-100%)";
      gameScreen.style.transform = "translateX(0)";
    } else if ((data.status = "round-start")) {
      // Assign role
      role = data.role;
      // Display everything per role
      if (role === "drawer") {
        //drawer code
        return;
      }
      //TODO
    } else if ((data.status = "round-end")) {
      //TODO
    } else if ((data.status = "game-end")) {
    }
  };

  eventSource.onerror = (error) => {
    console.log("Game SSE error", error);
    eventSource.close();
  };
};
