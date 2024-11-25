const PlayerModel = require("../models/playerModel");
const GameStateModel = require("../models/gameStateModel");
const AppStateModel = require("../models/appStateModel");

// exports.newRoom = (req, res, next) => {
//   console.log(req.body);
//   // make new player
//   const Player = new PlayerModel(req.body.name);
//   // make new room state
//   const Room = new GameStateModel(Player);
//   // send response to render the lobby
//   res.status(201).json({
//     status: "success",
//     data: { id: Player.id, roomKey: Room.roomKey },
//   });
// };

exports.joinRoom = (req, res, next) => {
  // make new player
  const Player = new PlayerModel(req.body.name);
  // create state or get state by key
  let Room;
  if (req.originalUrl === "/") {
    Room = new GameStateModel();
  } else {
    Room = AppStateModel.getRoom(req.params.code);
  }
  // add player to state
  Room.addPlayer(Player);

  // send response to render the lobby
  res.status(200).json({
    status: "success",
    data: { id: Player.id, roomKey: Room.roomKey },
  });
};

// Automatically show new players in lobby list
exports.lobbySSE = (req, res) => {
  const playerId = req.params.playerId;
  const code = req.params.code;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const Room = AppStateModel.getRoom(code);
  const Player = Room.players[playerId];
  Player.SSERes = res;

  //TODO send player join event to everyone in lobby
  const playerList = Room.getPlayerList();
  const data = {
    data: playerList,
    // data: "goober",
  };

  Object.values(Room.players).forEach((playerObj) => {
    playerObj.SSERes.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  //simulate data
  // const intervalId = setInterval(() => {
  //   const data = `Server Time: ${new Date().toLocaleTimeString()}`;
  //   sendData({ data });
  // }, 1000);

  // close connection when the client disconnects
  // req.on("close", () => {
  //   clearInterval(intervalId);
  // });
};
