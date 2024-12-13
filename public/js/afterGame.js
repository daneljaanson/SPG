import { getRoomAndPlayer } from "./utilities.js";

export const returnToLobby = () => {
  const [code, _] = getRoomAndPlayer();
  fetch(`/play/${code}/lobby`);
};
