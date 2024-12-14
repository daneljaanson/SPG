const PlayerModel = require("../models/playerModel");
const GameStateModel = require("../models/gameStateModel");
const AppStateModel = require("../models/appStateModel");

///////////////////////////
// Create or join a room
exports.joinRoom = (req, res) => {
  // create state or get state by key
  let Room;
  if (req.originalUrl === "/") {
    Room = new GameStateModel();
  } else {
    Room = getRoom(req, res);
    if (!Room) return;
  }

  if (!Room)
    return res.status(404).json({
      //forbidden
      status: "fail",
      data: { message: "Game not found" },
    });
  if (Room.gameState !== "lobby")
    return res.status(403).json({
      //forbidden
      status: "fail",
      data: { message: "Game has already started" },
    });

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
const getRoom = (req, res) => {
  const Room = AppStateModel.getRoom(req.params.code);
  if (!Room) {
    res.status(404).json({ status: "fail", data: "No room with that ID." });
    return undefined;
  }
  return Room;
};
// Automatically show new players in lobby list
exports.lobbySSE = (req, res) => {
  const Room = getRoom(req, res);
  if (!Room) return;
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
exports.startSSE = (req, res) => {
  // Get room
  const Room = getRoom(req, res);
  if (!Room) return;

  // Start client side SSE
  Room.startGameSSE();
};

// Start game
exports.startGame = (req, res) => {
  // Get  room
  const Room = getRoom(req, res);
  if (!Room) return;
  // Send start state to server if amount of connections is the same as players
  if (
    Object.keys(Room.players).length ===
    Object.keys(Room.stateSSEResponses).length
  ) {
    Room.startGame();
  }

  res.status(200).json({ status: "success", data: "event source confirmed" });
};

// Update picture
exports.pictureSSE = (req, res) => {
  // Start connection
  const Room = getRoom(req, res);
  if (!Room) return;
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
  const Room = getRoom(req, res);
  if (!Room) return;
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
  const Room = getRoom(req, res);
  if (!Room) return;
  const playerId = req.params.playerId;
  Room.stateSSEResponses[playerId] = res;

  // Start connection
  startSSE(res);

  req.on("close", () => {
    res.end();
  });
};

// Send comment update command
exports.sendComment = (req, res) => {
  // Get user and room
  const Room = getRoom(req, res);
  if (!Room) return;
  const playerId = req.params.playerId;
  // Send comment signal
  Room.checkSendComment(playerId, req.body.comment);

  res
    .status(200)
    .json({ status: "success", data: { message: "Comment sent" } });
};

// Send coordinates to players
exports.sendCoords = (req, res) => {
  const Room = getRoom(req, res);
  if (!Room) return;
  const playerId = req.params.playerId;

  // Send coordinate signal
  Room.sendCoordinates(playerId, req.body);

  res.status(200).json({ status: "success", data: { message: "Coord sent" } });
};

// Refresh your word
exports.refreshWord = (req, res) => {
  const Room = getRoom(req, res);
  if (!Room) return;
  const playerId = req.params.playerId;

  Room.assignSendWord(playerId);

  res
    .status(200)
    .json({ status: "success", data: { message: "New word sent" } });
};

exports.playAgain = (req, res) => {
  const Room = getRoom(req, res);
  if (!Room) return;
  if (!Room.gameState === "round-end") {
    res.status(403).json({
      status: "error",
      data: { message: "Cannot be used at this time" },
    });
    return;
  }

  Room.sendGameRestart();

  res
    .status(200)
    .json({ status: "success", data: { message: "New word sent" } });
};
