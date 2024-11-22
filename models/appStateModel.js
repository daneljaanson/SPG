"use strict";

const games = {};

//TODO
//TODO
//TODO
//TODO
//TODO

// Random uppercase letters
const randLetters = (n) => {
  let randString = "";
  for (let i = 0; i < n; i++)
    randString += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return randString;
};

// Check if key taken
const newKeyGen = (n) => {
  let newKey = "";
  for (let i = 0; i < 20; i++) {
    newKey = randLetters(n);
    if (!Object.hasOwn(games, newKey)) return newKey;
  }
  return null;
};

exports.newRoom = (gameState) => {
  //TODO real room keys
  const newKey = newKeyGen(5);
  games[newKey] = gameState;
  return newKey;
};

exports.getRoom = (code) => {
  if (games[code]) return games[code];
  console.log("Error in .getRoom");
};

exports.printPlayers = (code) => console.log(games[code].players);
