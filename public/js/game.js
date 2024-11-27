"use strict";

export const startGame = async () => {
  // Send start signal to server
  const response = await fetch(`http://127.0.0.1:3000/play`);
  console.log(response);
  if (response.status !== 200) return "error", response;
};

// TODO Add all game buttons and display
export const buildGameHtml = () => {};
