exports.sendStart = (Room) => {
  Object.values(Room.lobbySSEResponses).forEach((playerRes) => {
    playerRes.write(`data: ${JSON.stringify(data)}\n\n`);
    playerRes.close();
  });
  Object.values(Room.gameSSEResponses).forEach((playerRes) => {});
};
