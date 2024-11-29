const PlayerModel = require("../models/playerModel");
const GameStateModel = require("../models/gameStateModel");
const AppStateModel = require("../models/appStateModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

///////////////////////////
// JWT
const signToken = (id, code) =>
  jwt.sign({ id, code }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (id, code, req, res) => {
  const token = signToken(id, code);

  const cookieOptions = {
    expires: new Date(
      //expires in 90 days
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //firefox asks for it
    sameSite: "none",
    //cannot be modified by browser
    httpOnly: true,
    //https only
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  //REMOVE LATER TODO
  cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
    data: {
      id,
      code,
    },
    token,
  });
};

///////////////////////////
// SSE

// Decode token
// Return playerId and Room obj
const solveToken = async (req) => {
  // Decode token
  const token = req.cookies.jwt;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Assign values
  const code = decoded.code;
  const playerId = decoded.id;
  const Room = AppStateModel.getRoom(code);

  return [playerId, Room];
};

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

  // send response with cookie to render the lobby
  createSendToken(Player.id, Room.roomKey, req, res);
};

// Automatically show new players in lobby list
exports.lobbySSE = async (req, res) => {
  // Start connection
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const [playerId, Room] = await solveToken(req);
  Room.lobbySSEResponses[playerId] = res;

  // Send initial state command
  data = {
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

// Start game
exports.startGame = async (req, res) => {
  // Get user and room
  const [_, Room] = await solveToken(req);
  // Send start signal
  Room.writeLobby("start");
  // Change room state
  Room.gameState = "inGame";

  res.status(200).json({ status: "success", data: "game started" });
};

// Update picture
exports.pictureSSE = async (req, res) => {
  // Start connection
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const [playerId, Room] = await solveToken(req);
  Room.pictureSSEResponses[playerId] = res;

  // Send initial state command
  data = {
    status: "init",
    data: "picture sse init",
  };
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  req.on("close", () => {
    res.end();
  });
};

// Update comments
exports.commentSSE = async (req, res) => {
  // Start connection
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const [playerId, Room] = await solveToken(req);
  Room.commentSSEResponses[playerId] = res;
  console.log("comment sse resposne added");

  // Send initial state command
  data = {
    comment: "comment SSE init",
  };
  setTimeout(() => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);

  req.on("close", () => {
    res.end();
  });
};

// Send comment update command
exports.sendComment = async (req, res) => {
  // Get user and room
  const [playerId, Room] = await solveToken(req);
  // Send start signal
  Room.sendComment(playerId, req.body.comment);

  res
    .status(200)
    .json({ status: "success", data: { message: "Comment sent" } });
};
