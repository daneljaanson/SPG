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
    Room = AppStateModel.getRoom(req.params.code);
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

// Automatically show new players in lobby list
exports.lobbySSE = (req, res) => {
  // Start connection
  startSSE(res);
  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;
  Room.lobbySSEResponses[playerId] = res;

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
  const Room = AppStateModel.getRoom(req.params.code);
  // Start SSE
  Room.startGameSSE();
};

// Start game
exports.startGame = (req, res) => {
  // Get  room
  const Room = AppStateModel.getRoom(req.params.code);
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
  startSSE(res);

  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;
  Room.pictureSSEResponses[playerId] = res;

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
  // Start connection
  startSSE(res);

  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;
  Room.commentSSEResponses[playerId] = res;

  // Send initial state command
  const data = {
    comment: "comment SSE init",
  };
  setTimeout(() => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    Room.sendComment(playerId, "pasinga");
  }, 2000);

  req.on("close", () => {
    res.end();
  });
};

exports.stateSSE = (req, res) => {
  // Start connection
  startSSE(res);

  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;
  Room.stateSSEResponses[playerId] = res;

  req.on("close", () => {
    res.end();
  });
};

// Send comment update command
exports.sendComment = (req, res) => {
  // Get user and room
  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;
  // Send comment signal
  Room.sendComment(playerId, req.body.comment);

  res
    .status(200)
    .json({ status: "success", data: { message: "Comment sent" } });
};

// Send coordinates to players
exports.sendCoords = (req, res) => {
  const Room = AppStateModel.getRoom(req.params.code);
  const playerId = req.params.playerId;

  // Send coordinate signal
  Room.sendCoordinates(playerId, req.body.stroke);

  res
    .status(200)
    .json({ status: "success", data: { message: "Comment sent" } });
};
