"use strict";

import { getRoomAndPlayer } from "./utilities.js";
import * as drawing from "./drawing.js";

// Screens
const introScreen = document.querySelector(".container--intro");
const roomScreen = document.querySelector(".container--room");
const gameScreen = document.querySelector(".container--game");
const afterRoundScreen = document.querySelector(".container--round-end");
const drwScreenPicture = document.querySelector("#drwScreenPicture");

// Containers
const drawingListEl = document.querySelector(".round-end__drawings");

// Lists
const playerListLobbyEl = document.querySelector(".room__player-list");
const playerListGameEl = document.querySelector(".game__info--player-list");
const commentListEl = document.querySelector(".game__info--comment-list");
const roundEndScoresEl = document.querySelector(".round-end__scores");

// Labels
const roleLabelEl = document.querySelector(".drwScreen__picture--role");

// Text
const infoTextEl = document.querySelector(".game__info--info-text");

("use strict");
let curScreenName = "intro";
let gameEventSources;

const updatePlayerList = (playerList) => {
  // Add top players and scores to player list
  playerListGameEl.innerHTML = "";
  playerList.forEach(([name, points]) => {
    playerListGameEl.innerHTML += `<li>${name}<span>${points}</span></li>`;
  });
};

// Hide and display screens
const nextScreen = (screenName) => {
  const screens = {
    intro: introScreen,
    room: roomScreen,
    game: gameScreen,
    afterRound: afterRoundScreen,
  };
  // Hide all screens besides next and current
  // Set display to auto on cur and next screen
  for (const [name, screenEl] of Object.entries(screens)) {
    if (screenName === name || name === curScreenName) {
      screenEl.style.display = "block";
      continue;
    }
    screenEl.style.display = "none";
    screenEl.style.transform = "translateX(100%)";
  }
  // Move current screen out of view and new screen into view
  setTimeout(() => {
    screens[curScreenName].style.transform = "translateX(-100%)";
    screens[screenName].style.transform = "translateX(0%)";
  }, 50);
  setTimeout(() => {
    const saveCurScreen = JSON.parse(JSON.stringify(curScreenName));
    screens[saveCurScreen].style.display = "none";
    console.log("closed" + curScreenName);
    curScreenName = screenName;
  }, 1500);
};

// Close all sources
const closeSources = () => {
  Object.values(gameEventSources).forEach((eventSource) => eventSource.close());
};

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
      nextScreen("room");
      // Delete old pictures
      drawingListEl.innerHTML = "";
      // On game start, start gameSSE
    } else if (data.status === "game-start") {
      gameEventSources = gameSources();
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
  const eventSourceState = stateSource();
  const eventSourcePicture = pictureSource();
  const eventSourceComment = commentSource();

  // Send confirmation that event sources started
  await fetch(`/play/${getRoomAndPlayer()[0]}/ok`);

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
    const data = JSON.parse(event.data);
    //  display coords
    if (data.strokeObj) {
      drawing.saveStroke(data.id, data.strokeObj);
      drawing.drawStroke(data.strokeObj);
    }
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

    // If correct guess, display something
    if (data.status === "correct-guess") {
      // Add success alert to messages
      commentListEl.innerHTML += `<li>- ${data.winners.guesser} guessed ${data.winners.drawer}'s drawing! ${data.winners.drawer} drew ${data.winners.word} -</li>`;
      ////////////////////////////
      /// MAKE NEW ALERT ELEMENT

      // Make new success element
      // const successEl = document.createElement("p");
      // successEl.setAttribute("class", "pointAlert");
      // // Find available alert id
      // let count = 0;

      // Object.values(alertContainer.children).forEach((child) => {
      //   if (child.getAttribute("data-alert" === count)) count++;
      // });
      // successEl.setAttribute("data-alert", count);
      // Set success element text
      // successEl.textContent = `${data.winners.guesser} guessed ${data.winners.drawer}'s drawing!`

      // Append new element and select it to show alert
      // alertContainer.appendChild(successEl);
      // const successNode = document.querySelector(
      //   `.pointAlert[data-alert="${count}"]`
      // );
      // setTimeout(() => {
      //   alertContainer.removeChild(successNode);
      // }, 2000);

      ////////////////////////////
      /// UPDATE PLAYER LIST
      updatePlayerList(data.players);

      ////////////////////////////
      /// SAVE WHOLE DRAWING AND REMOVE GUESSED IMAGE
      // Add saved image to round-end list. Converts canvas drawing to png
      drwScreenPicture.toBlob((blob) => {
        // Create new elements
        const newDiv = document.createElement("div");
        newDiv.classList.add("round-end__drawing");

        const newP = document.createElement("p");
        newP.textContent = `Word: ${data.winners.word} by ${data.winners.drawer}. Guessed by: ${data.winners.guesser}`;
        newP.classList.add("round-end__drawing--text");

        ////////////////////////////
        // Make and configure image
        const newImg = document.createElement("img");
        newImg.classList.add("round-end__drawing--img");

        // Create png url from blob
        const url = URL.createObjectURL(blob);

        // newImg.onload = () => {
        //   // no longer need to read the blob so it's revoked
        //   URL.revokeObjectURL(url);
        // };
        newImg.src = url;

        // Insert elements to dom
        newDiv.append(newImg);
        newDiv.append(newP);
        drawingListEl.append(newDiv);
      });

      ////////////////////////////
      /// HIGHLIGHT DRAWING
      drawing.highlightDrawing(data.winners.drawerId);
    }

    // Scroll to end
    commentListEl.scrollTop = commentListEl.scrollHeight;
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

  eventSource.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.status === "new-word") {
      infoTextEl.textContent = `${data.word}`;
      setTimeout(() => {
        drawing.deleteDrawings(data.id);
      }, 1000);
    }
    if (data.status === "round-start") {
      // Enable game screen
      // drwScreenPicture.style.userSelect = "auto";
      drwScreenPicture.style.pointerEvents = "auto";
      // Move to game screen
      nextScreen("game");

      // Resize canvas ( needs to be updated after css transition  )
      setTimeout(() => {
        drawing.resize();
      }, 2000);

      updatePlayerList(data.players);

      // Show role and info
      roleLabelEl.textContent = data.role;
      infoTextEl.textContent = `${data.word}`;
      // Start guessing timer
    }
    if (data.status === "round-end") {
      nextScreen("afterRound");
      // Delete everything drawn
      setTimeout(() => {
        drawing.deleteDrawings();
      }, 5000);
      // Get player list for game end score list
      roundEndScoresEl.innerHTML = "";
      data.players.forEach(([name, points]) => {
        roundEndScoresEl.innerHTML += `<li class="round-end__score">${name}: <span>${points}</span></li>`;
      });
    }
    // After game, return to lobby screen
    if (data.status === "lobby") {
      nextScreen("lobby");
      closeSources();
      initSource();
    }
  });

  eventSource.onerror = (error) => {
    console.log("State SSE error", error);
    eventSource.close();
  };

  return eventSource;
};
