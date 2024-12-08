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
// [[[x, y], [...]], [...]]
const drawingCoords = [];
// [[x, y], [...]]
let currentStroke = [];

////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////

// Translate coords to fractions of current viewport
const coordsToFrac = (x, y) => {
  return [x / curRect.width, y / curRect.height];
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

const redrawPainting = (context, drawingCoords) => {
  drawingCoords.forEach((stroke) => {
    drawStroke(stroke);
  });
};

const resize = (e) => {
  // Save current size to variable
  curRect = drwScreenPicture.getBoundingClientRect();
  // Aspect ratio 3/4 - Also check CSS
  drwScreenPicture.height = drwScreenContainer.clientHeight;
  drwScreenPicture.width = (drwScreenPicture.height * 3) / 4;
  // Get new context for this size
  context = drwScreenPicture.getContext("2d");
  redrawPainting(context, drawingCoords);
};
resize();

const drawLine = (context, x1, y1, x2, y2) => {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
};

// Resize drawing screen by js (so context would stay relevant)
window.addEventListener("resize", resize);

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

export const drawStroke = (stroke) =>
  stroke.forEach(([fracX, fracY], i, arr) => {
    if (i !== arr.length - 1) {
      const [x, y] = fracToCoords(fracX, fracY);
      const [nextX, nextY] = fracToCoords(arr[i + 1][0], arr[i + 1][1]);
      drawLine(context, x, y, nextX, nextY);
    }
  });

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
    isDrawing = false;
    x = 0;
    y = 0;
    // Make deep copy
    const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
    drawingCoords.push(currentStrokeCopy);
    // Send stroke
    sendDrawingStroke(currentStrokeCopy);
    currentStroke = [];
  });

  /////////////////////////////////////////////////////////
  // Touch
  drwScreenPicture.addEventListener("touchstart", (e) => {
    e.preventDefault();

    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      ongoingTouches.push(copyTouch(touches[i]));
      context.beginPath();
      context.arc(
        touches[i].pageX - curRect.left,
        touches[i].pageY - curRect.top,
        4,
        0,
        2 * Math.PI,
        false
      );
      context.fillStyle = "black";
      context.fill();
      // Save for resize
      currentStroke.push(
        coordsToFrac(
          touches[i].pageX - curRect.left,
          touches[i].pageY - curRect.top
        )
      );
    }
  });
  drwScreenPicture.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const index = ongoingTouchIndexById(touches[i].identifier);
      // Continue touch
      if (index >= 0) {
        context.beginPath();
        context.moveTo(
          ongoingTouches[index].pageX - curRect.left,
          ongoingTouches[index].pageY - curRect.top
        );
        context.lineTo(
          touches[i].pageX - curRect.left,
          touches[i].pageY - curRect.top
        );
        context.lineWidth = 4;
        context.strokeStyle = "black";
        context.stroke();

        ongoingTouches.splice(index, 1, copyTouch(touches[i]));
        // Save for resize
        currentStroke.push(
          coordsToFrac(
            touches[i].pageX - curRect.left,
            touches[i].pageY - curRect.top
          )
        );
      } else {
        console.log("cant figure out where to continue with touch");
      }
    }
  });
  drwScreenPicture.addEventListener("touchend", (e) => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      let index = ongoingTouchIndexById(touches[i].identifier);

      if (index >= 0) {
        context.lineWidth = 4;
        context.fillStyle = "black";
        context.beginPath();
        context.moveTo(
          ongoingTouches[index].pageX - curRect.left,
          ongoingTouches[index].pageY - curRect.top
        );
        context.lineTo(
          touches[i].pageX - curRect.left,
          touches[i].pageY - curRect.top
        );
        ongoingTouches.splice(index, 1);
        // Save for resize
        currentStroke.push(
          coordsToFrac(
            touches[i].pageX - curRect.left,
            touches[i].pageY - curRect.top
          )
        );
        // Make deep copy
        const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
        drawingCoords.push(currentStrokeCopy);
        // Send stroke
        sendDrawingStroke(currentStrokeCopy);
        currentStroke = [];
      } else {
        console.log("cant figure out where to continue with touch");
      }
    }
  });
};

// Send coordinates to others
