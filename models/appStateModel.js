"use strict";

const nodeUtilities = require("../utils/nodeUtilities.js");

const fs = require("fs");

// Games object keys are room codes
const games = {};

// Open game's dictionary
const wordList = fs
  .readFileSync(`${__dirname}/../word_lists/dictionary.txt`, "UTF-8")
  .split("\r\n");

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
  const newKey = newKeyGen(process.env.ROOM_KEY_LENGTH);
  games[newKey] = gameState;
  return newKey;
};

exports.getRoom = (code) => {
  if (games[code]) return games[code];
  return undefined;
};

exports.randomWord = () => {
  const word = wordList[nodeUtilities.randInt(0, wordList.length)];
  return word;
};
