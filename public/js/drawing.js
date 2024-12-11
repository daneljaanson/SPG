import { sendDrawingStroke } from "./game.js";
import { randomColors } from "./utilities.js";
("use strict");

// TESTO
const roleLabelEl = document.querySelector(".drwScreen__picture--role");

// Div
const drwScreenContainer = document.querySelector(
  ".drwScreen__picture-container"
);
const toolContainer = document.querySelector(".drwScreen__tools");
const colorContainer = document.querySelector(".drwScreen__colors");
// Canvas
const drwScreenPicture = document.querySelector("#drwScreenPicture");

//////////////////////////////////////////////////////
// Variables

// Context
let context;
// Save last rect
let curRect;

let isDrawing = false;
let x = 0;
let y = 0;
// { playerId: [[[x, y], [...]], [...]]}
const drawingCoords = {};
// { drawingcoords, toolOptions }
const guessedDrawings = [];
// [[x, y], [...]]
let currentStroke = [];

// Possible tool and color options
const strokeStyleArr = randomColors(8);
strokeStyleArr.unshift("white", "black");
const lineWidthArr = [1, 3, 5, 7, 9, 11, 13, 15];

// Save tool and color
const toolOptions = { lineWidth: 5, strokeStyle: "black" };

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

// Redraw paintings from all drawers
const redrawPainting = (drawingCoords) => {
  Object.values(drawingCoords).forEach((strokeArr) => {
    strokeArr.forEach((strokeObj) => {
      drawStroke(strokeObj);
    });
  });
};

// 0 is already drawn, previous line
// 1 is current position
// 2 is destination to draw to
const drawLine = (context, x1, y1, x2, y2, options) => {
  context.beginPath();
  context.strokeStyle = options.strokeStyle;
  context.lineWidth = options.lineWidth;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
};

// Draw over the drawing with a red line
const highlightDrawing = (drawerId) => {
  drawingCoords[drawerId].forEach((strokeObj) => {
    const modStrokeObj = {
      coordinates: strokeObj.coordinates,
      options: {
        lineWidth: strokeObj.options.lineWidth + 1,
        strokeStyle: "red",
      },
    };
    drawStroke(modStrokeObj);
  });
};

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

export const redrawPaintingPostGame = (context, rect) => {
  // Get painting from saved
  const painting = guessedDrawings[0];
};

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
export const drawStroke = (strokeObj, strokeContext = context) =>
  strokeObj.coordinates.forEach(([fracX, fracY], i, arr) => {
    if (i !== arr.length - 1) {
      const [x, y] = fracToCoords(fracX, fracY);
      const [nextX, nextY] = fracToCoords(arr[i + 1][0], arr[i + 1][1]);
      drawLine(strokeContext, x, y, nextX, nextY, strokeObj.options);
    }
  });

//strokeObj is {coordinates: [], options: {}}
export const saveStroke = (playerId, strokeObj) => {
  if (!drawingCoords[playerId]) drawingCoords[playerId] = [];
  drawingCoords[playerId].push(strokeObj);
};

// Combine correct guess info with drawing and save for game-end
export const saveDrawing = async (drawingInfoObj, highlight = true) => {
  const drawingsCopy = JSON.parse(JSON.stringify(drawingCoords));
  const drawingInfoCopy = JSON.parse(JSON.stringify(drawingInfoObj));
  const drawingObj = {
    drawings: drawingsCopy,
    info: drawingInfoCopy,
  };
  guessedDrawings.push(drawingObj);
  if (highlight) {
    highlightDrawing(drawingObj.info.drawerId);
  }

  return;
};

export const deleteDrawings = (...drawerIds) => {
  if (drawerIds.length === 0) drawingCoords = {};
  if (drawerIds.length > 0) {
    drawerIds.forEach((drawerId) => {
      drawingCoords[drawerId] = [];
    });
  }
  resize();
};

// Add event listeners to canvas to draw and save drawing coordinates
export const drawingHandlers = () => {
  /////////////////////////////////////////////////////////
  // Toolbars

  ///////////
  // Colors
  // Make HTML elements
  colorContainer.innerHTML = "";
  strokeStyleArr.forEach((color, i) => {
    colorContainer.innerHTML += `<div class="drwScreen__color" style="background-color:${color}"></div>`;
  });
  // Add event handlers to swap style
  Object.values(colorContainer.children).forEach((child) => {
    child.addEventListener("click", (e) => {
      toolOptions.strokeStyle = child.style.backgroundColor;
    });
  });

  ///////////
  // Tool sizes
  // Make HTML elements
  toolContainer.innerHTML = "";
  lineWidthArr.forEach((toolSize, i) => {
    const sizeRem = (toolSize / 10).toFixed(1);
    toolContainer.innerHTML += `<div class="drwScreen__tool" data-size="${toolSize}"><span class="tool-icon" style="height:${sizeRem}rem; width:${sizeRem}rem"></span></div>`;
  });
  // Add event handlers to swap tool size
  Object.values(toolContainer.children).forEach((child) => {
    child.addEventListener("click", (e) => {
      toolOptions.lineWidth = Number(child.getAttribute("data-size"));
    });
  });
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
      drawLine(context, x, y, e.offsetX, e.offsetY, toolOptions);
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
    sendDrawingStroke(currentStrokeCopy, toolOptions);
    currentStroke = [];
  });

  /////////////////////////////////////////////////////////
  // Touch
  drwScreenPicture.addEventListener("touchstart", (e) => {
    e.preventDefault();

    const touch = e.changedTouches[0];
    x = touch.pageX - curRect.left;
    y = touch.pageY - curRect.top;
    currentStroke.push(coordsToFrac(x, y));
  });
  drwScreenPicture.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    drawLine(
      context,
      x,
      y,
      touch.pageX - curRect.left,
      touch.pageY - curRect.top,
      toolOptions
    );
    x = touch.pageX - curRect.left;
    y = touch.pageY - curRect.top;
    // Save for resize
    currentStroke.push(coordsToFrac(x, y));
  });
  drwScreenPicture.addEventListener("touchend", (e) => {
    e.preventDefault();
    x = 0;
    y = 0;
    // Make deep copy
    const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
    // Send stroke
    sendDrawingStroke(currentStrokeCopy, toolOptions);
    currentStroke = [];
  });
};

// Send coordinates to others
