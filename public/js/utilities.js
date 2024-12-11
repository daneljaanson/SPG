export const getRoomAndPlayer = () => {
  const codeLabel = document.querySelector(".room__code");
  return [codeLabel.textContent, codeLabel.getAttribute("data-player")];
};

export const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

export const randomColors = (n) => {
  const colorArr = [];
  for (let i = 0; i < n; i++) {
    colorArr.push(randomColor());
  }
  return colorArr;
};
