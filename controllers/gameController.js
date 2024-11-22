const PlayerModel = require("../models/playerModel");
const GameStateModel = require("../models/gameStateModel");
const AppStateModel = require("../models/appStateModel");

exports.newRoom = (req, res, next) => {
  console.log(req.body);
  // make new player
  const Player = new PlayerModel(req.body.name);
  // make new room state
  const Room = new GameStateModel(Player);
  //TODO

  //TODO send response to render the lobby

  res.status(201).json({ status: "success", data: { Room, Player } });
};

exports.joinRoom = (req, res, next) => {
  //TODO make new player
  const Player = new PlayerModel(req.body.name);
  //TODO get state by key
  const Room = AppStateModel.getRoom(req.params.code);
  //TODO add player to state
  Room.addPlayer(Player);
  //TODO send response to render the lobby

  res.status(200).json({ status: "success", data: { Room, Player } });
};

// Automatically show new players in lobby list
exports.lobbySSE = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  //simulate data
  // const intervalId = setInterval(() => {
  //   const data = `Server Time: ${new Date().toLocaleTimeString()}`;
  //   sendData({ data });
  // }, 1000);

  //close connection when the client disconnects
  // req.on("close", () => {
  //   clearInterval(intervalId);
  // });
};
