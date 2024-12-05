export const getRoomAndPlayer = () => {
  const codeLabel = document.querySelector(".room__code");
  return [codeLabel.textContent, codeLabel.getAttribute("data-player")];
};
