const PlayerModel = require("../models/playerModel");
const GameStateModel = require("../models/gameStateModel");
const AppStateModel = require("../models/appStateModel");
const AppError = require("../utils/appError.js");

///////////////////////////
// Create or join a room
exports.joinRoom = (req, res) => {
  // create state or get state by key
  let Room;
  if (req.originalUrl === "/") {
    Room = new GameStateModel();
  } else {
    Room = req.params.room;
  }

  if (!Room)
    return res.status(404).json({
      //forbidden
      status: "fail",
      data: { message: "Game not found" },
    });
  // game cannot be joined if it isnt in the round-end stage or the lobby stage
  if (Room.gameState !== "lobby" && Room.gameState !== "round-end")
    return res.status(403).json({
      //forbidden
      status: "fail",
      data: { message: "Game has already started" },
    });
  // Set state to lobby (useful if joining from round end)
  Room.setState("lobby");
  // make new player
  const Player = new PlayerModel(req.body.name);
  // add player to state
  Room.addPlayer(Player);
  // send response with "cookie" to render the lobby
  res.status(200).json({
    status: "success",
    data: {
      id: Player.id,
      code: Room.roomKey,
    },
  });
};

// SSE Start
const startSSE = (res) =>
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

// Check if room is in appstate
exports.getRoom = (req, res, next) => {
  const Room = AppStateModel.getRoom(req.params.code);
  if (!Room) {
    next(new AppError("No room with that ID", 404));
    // res.status(404).json({ status: "fail", data: "No room with that ID." });
    return undefined;
  }
  req.params.room = Room;
  next();
};
// Automatically show new players in lobby list
exports.lobbySSE = (req, res) => {
  const Room = req.params.room;
  const playerId = req.params.playerId;
  Room.lobbySSEResponses[playerId] = res;

  // Start connection
  startSSE(res);

  // Send initial state command
  const data = {
    status: "init",
    data: "",
  };
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  // send player join event to everyone in lobby
  const playerList = Room.getPlayerList();
  Room.writeLobby("open", playerList);

  req.on("close", () => {
    res.end();
  });
};

// Start SSE before game
// at /play/:code/
exports.startSSE = (req, res) => {
  // Get room
  const Room = req.params.room;
  // Start client side SSE
  Room.startGameSSE();
  // Close request
  res
    .status(200)
    .json({ status: "success", data: "start game signal received" });
};

// Start game
// at /play/:code/ok/ -- Sent automatically from eventSources.js
// Gets called after someone initializes SSEs
exports.startGame = (req, res, next) => {
  // Get  room
  const Room = req.params.room;
  // Send start state to server if amount of connections is the same as players
  let started = true;
  if (
    Object.keys(Room.players).length ===
    Object.keys(Room.stateSSEResponses).length
  ) {
    started = Room.setState("game-start");
  }
  if (!started) return next(new AppError("Game already started", 403));
  res.status(200).json({ status: "success", data: "event sources confirmed" });
};

// Update picture
exports.pictureSSE = (req, res) => {
  // Start connection
  const Room = req.params.room;
  const playerId = req.params.playerId;
  Room.pictureSSEResponses[playerId] = res;

  // Start connection
  startSSE(res);

  // Send initial state command
  const data = {
    status: "init",
    data: "picture sse init",
  };
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  req.on("close", () => {
    res.end();
  });
};

// Update comments
exports.commentSSE = (req, res) => {
  const Room = req.params.room;
  const playerId = req.params.playerId;
  Room.commentSSEResponses[playerId] = res;

  // Start connection
  startSSE(res);

  // Send initial state command
  const data = {
    comment: "Welcome to Vidya",
  };
  setTimeout(() => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);

  req.on("close", () => {
    res.end();
  });
};

exports.stateSSE = (req, res) => {
  const Room = req.params.room;
  const playerId = req.params.playerId;
  Room.stateSSEResponses[playerId] = res;
  console.log("player id state sse", playerId);

  // Start connection
  startSSE(res);

  req.on("close", () => {
    res.end();
  });
};

// Send comment update command
exports.sendComment = (req, res) => {
  // Get user and room
  const Room = req.params.room;
  const playerId = req.params.playerId;
  // Send comment signal
  Room.checkSendComment(playerId, req.body.comment);

  res
    .status(200)
    .json({ status: "success", data: { message: "Comment sent" } });
};

// Send coordinates to players
exports.sendCoords = (req, res) => {
  const Room = req.params.room;
  const playerId = req.params.playerId;

  // Send coordinate signal
  Room.sendCoordinates(playerId, req.body);
  res.status(200).json({ status: "success", data: { message: "Coord sent" } });
};

// Refresh your word
exports.refreshWord = (req, res) => {
  const Room = req.params.room;
  const playerId = req.params.playerId;

  Room.assignSendWord(playerId);

  res
    .status(200)
    .json({ status: "success", data: { message: "New word sent" } });
};
