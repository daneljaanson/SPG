import { sendDrawingStroke } from "./game.js";
("use strict");

// TESTO
const roleLabelEl = document.querySelector(".drwScreen__picture--role");

// Div
const drwScreenContainer = document.querySelector(
  ".drwScreen__picture-container"
);
// Canvas
const drwScreenPicture = document.querySelector("#drwScreenPicture");
// Context
let context;
// Save last rect
let curRect;

// Variables
const ongoingTouches = [];
let isDrawing = false;
let x = 0;
let y = 0;
// { playerId: [[[x, y], [...]], [...]]}
const drawingCoords = [];
// [[x, y], [...]]
let currentStroke = [];

////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////

// Translate coords to fractions of current viewport
const coordsToFrac = (x, y) => {
  // Shorten the numbers
  const newX = Number((x / curRect.width).toFixed(4));
  const newY = Number((y / curRect.height).toFixed(4));
  return [newX, newY];
};
// Translate fractions to coords
const fracToCoords = (fracX, fracY) => {
  return [
    Math.round(fracX * curRect.width),
    Math.round(fracY * curRect.height),
  ];
};

// Some browsers want a new object
const copyTouch = function ({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
};

// Find saved touch by id
const ongoingTouchIndexById = function (idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === idToFind) return i;
  }
  return -1; //not found
};

const redrawPainting = (drawingCoords) => {
  Object.values(drawingCoords).forEach((coordinates) => {
    coordinates.forEach((stroke) => {
      drawStroke(stroke);
    });
  });
};

const drawLine = (context, x1, y1, x2, y2) => {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
};

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

// Update canvas size and redraw the painting
export const resize = (e) => {
  // Aspect ratio 3/4 - Also check CSS
  drwScreenPicture.height = drwScreenContainer.clientHeight;
  drwScreenPicture.width = (drwScreenPicture.height * 3) / 4;
  // Save current size to variable
  curRect = drwScreenPicture.getBoundingClientRect();
  // Get new context for this size
  context = drwScreenPicture.getContext("2d");
  // Draw saved picture using new context
  redrawPainting(drawingCoords);
};

// Resize drawing screen by js (so context would stay relevant)
window.addEventListener("resize", resize);

// Draw one mouse click cycle [[fracX, fracY],[..]]
export const drawStroke = (stroke) =>
  stroke.forEach(([fracX, fracY], i, arr) => {
    if (i !== arr.length - 1) {
      const [x, y] = fracToCoords(fracX, fracY);
      const [nextX, nextY] = fracToCoords(arr[i + 1][0], arr[i + 1][1]);
      drawLine(context, x, y, nextX, nextY);
    }
  });

export const saveStroke = (playerId, stroke) => {
  console.log("there is no player set: ", !drawingCoords[playerId]);
  if (!drawingCoords[playerId]) drawingCoords[playerId] = [];
  drawingCoords[playerId].push(stroke);
};

// Add event listeners to canvas to draw and save drawing coordinates
export const drawingHandlers = () => {
  /////////////////////////////////////////////////////////
  // Mouse
  drwScreenPicture.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    currentStroke.push(coordsToFrac(x, y));
  });
  drwScreenPicture.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
      currentStroke.push(coordsToFrac(x, y));
      roleLabelEl.textContent = coordsToFrac(x, y);
    }
  });
  window.addEventListener("mouseup", (e) => {
    // e.target.style.backgroundColor = "red";
    isDrawing = false;
    x = 0;
    y = 0;
    // Make deep copy
    const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
    // Send stroke
    sendDrawingStroke(currentStrokeCopy);
    currentStroke = [];
  });

  /////////////////////////////////////////////////////////
  // Touch
  drwScreenPicture.addEventListener("touchstart", (e) => {
    e.preventDefault();

    const touches = e.changedTouches;
    console.log(touches);
    for (let i = 0; i < touches.length; i++) {
      // Set current X
      x = touches[i].pageX - curRect.left;
      y = touches[i].pageY - curRect.top;
      //
      ongoingTouches.push(copyTouch(touches[i]));
      drawLine(context, x, y, x, y);
      // Save for resize
      currentStroke.push(coordsToFrac(x, y));
    }
  });
  drwScreenPicture.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const index = ongoingTouchIndexById(touches[i].identifier);

      // Continue touch
      if (index >= 0) {
        const lastX = ongoingTouches[index].pageX - curRect.left;
        const lastY = ongoingTouches[index].pageY - curRect.top;
        x = touches[i].pageX - curRect.left;
        y = touches[i].pageY - curRect.top;
        drawLine(context, lastX, lastY, x, y);

        ongoingTouches.splice(index, 1, copyTouch(touches[i]));
        // Save for resize
        currentStroke.push(coordsToFrac(x, y));
      } else {
        console.log("cant figure out where to continue with touch");
      }
    }
  });
  drwScreenPicture.addEventListener("touchend", (e) => {
    e.preventDefault();
    isDrawing = false;
    x = 0;
    y = 0;
    // Make deep copy
    const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
    // Send stroke
    sendDrawingStroke(currentStrokeCopy);
    currentStroke = [];
  });
};

// Send coordinates to others
