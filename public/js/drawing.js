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
let curRect = drwScreenPicture.getBoundingClientRect();

let isDrawing = false;
let x = 0;
let y = 0;
// { playerId: [[[x, y], [...]], [...]]}
let drawingCoords = {};
// [[x, y], [...]]
let currentStroke = [];

// Possible tool and color options
const strokeStyleArr = randomColors(8);
strokeStyleArr.unshift("white", "black");
// Line widths are 1 = 1 at 300x400 resolution
// Will get converted to frac in tool options
const lineWidthArr = [1, 3, 5, 7, 9, 11, 13, 15, 20];
// Minwidth is where all lineWidthArr sizes are 1 to 1 (Ex: Line width 20 brush is 20px when screen is 300px wide)
const minWidth = 250;
// [[x / minsize * cursize], [...]]
// 1 at 300 width is 1px, 1 at 600 width is 2px
let lineWidthConvertedArr = [];

// Save tool and color
// Must be fract, all drawing functions multiply by cur width
const toolOptions = {
  lineWidth: 1,
  strokeStyle: "black",
};

// Limit body size to:
const maxBodySizeKb = 10;

////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////

// Convert line width array to current width
const convertLineWidths = (screenX = curRect.width) => {
  lineWidthConvertedArr = [];
  lineWidthArr.forEach((width) => {
    lineWidthConvertedArr.push(convertLineWidth(width, screenX));
  });
};

// Convert line width from default width to new width ( OR FROM OLD WIDTH TO NEW )
const convertLineWidth = (
  lineWidth,
  screenX = curRect.width,
  oldScreenX = minWidth
) => Number(((lineWidth / oldScreenX) * screenX).toFixed(1));
convertLineWidths();

const remakeDrawingTools = () => {
  toolContainer.innerHTML = "";
  lineWidthConvertedArr.forEach((toolSizeConverted, i) => {
    const sizeRem = (toolSizeConverted / 10).toFixed(1);
    toolContainer.innerHTML += `<div class="drwScreen__tool" data-size="${toolSizeConverted}"><span class="tool-icon" style="height:${sizeRem}rem; width:${sizeRem}rem"></span></div>`;
  });
  // Add event handlers to swap tool size
  Object.values(toolContainer.children).forEach((child) => {
    child.addEventListener("click", (e) => {
      toolOptions.lineWidth = Number(child.getAttribute("data-size"));
    });
  });
};

// Tool sizes will be sent in fractions so they can be converted using current width of recipient
const toolOptionsToFrac = (toolOptions) => {
  const toolOptionsCopy = {
    strokeStyle: toolOptions.strokeStyle,
    lineWidth: toolOptions.lineWidth / curRect.width,
  };
  return toolOptionsCopy;
};
const toolOptionsToNumber = (toolOptions) => {
  const toolOptionsCopy = {
    strokeStyle: toolOptions.strokeStyle,
    lineWidth: toolOptions.lineWidth * curRect.width,
  };
  return toolOptionsCopy;
};
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

// 1 is last position
// 2 is destination to draw to (cur pos)
// const drawLine = (x1, y1, x2, y2, options) => {
//   context.beginPath();
//   context.strokeStyle = options.strokeStyle;
//   context.lineWidth = options.lineWidth;
//   context.moveTo(x1, y1);
//   context.lineTo(x2, y2);
//   context.stroke();
//   context.closePath();
// };

const drawArc = (x2, y2, options) => {
  const toolOptionsNr = toolOptionsToNumber(options);
  context.beginPath();
  context.strokeStyle = toolOptionsNr.strokeStyle;
  // Must be divided (along radius) to get the same diameter as line width
  context.lineWidth = toolOptionsNr.lineWidth / 2;
  // Fill an arc
  context.arc(x2, y2, toolOptionsNr.lineWidth / 4, 0, 360);
  context.closePath();
  context.fill();
  context.stroke();
};

// drawline local. will display what the user has drawn (more detailed, will only be displayed to the drawer)
const drawLineLocal = (x1, y1, x2, y2, options) => {
  const toolOptionsNr = toolOptionsToNumber(options);
  context.strokeStyle = toolOptionsNr.strokeStyle;
  context.lineWidth = toolOptionsNr.lineWidth / 2;
  // Arc at end
  context.beginPath();
  context.arc(x2, y2, toolOptionsNr.lineWidth / 4, 0, 360);
  context.closePath();
  context.fill();
  context.stroke();
  // Draw line to next ( fast movement with arcs leaves dots, not a connected line)
  context.beginPath();
  context.lineWidth = toolOptionsNr.lineWidth;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
};

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

// Draw one mouse click cycle [[fracX, fracY],[..]]
export const drawStroke = (strokeObj) => {
  // Draw arc at the beginning of the stroke
  const [x0, y0] = fracToCoords(...strokeObj.coordinates[0]);
  drawArc(x0, y0, strokeObj.options);
  // Draw the rest of the stroke
  strokeObj.coordinates.forEach(([fracX, fracY], i, arr) => {
    if (i !== arr.length - 1) {
      const [x, y] = fracToCoords(fracX, fracY);
      const [nextX, nextY] = fracToCoords(arr[i + 1][0], arr[i + 1][1]);
      drawLineLocal(x, y, nextX, nextY, strokeObj.options);
    }
  });
};

//strokeObj is {coordinates: [], options: {}}
export const saveStroke = (playerId, strokeObj) => {
  if (!drawingCoords[playerId]) drawingCoords[playerId] = [];
  drawingCoords[playerId].push(strokeObj);
};

// Draw over the drawing with a red line
export const highlightDrawing = (drawerId) => {
  if (!drawingCoords[drawerId]) return;
  drawingCoords[drawerId].forEach((strokeObj) => {
    const modStrokeObj = {
      coordinates: strokeObj.coordinates,
      options: toolOptionsToFrac({
        lineWidth: strokeObj.options.lineWidth * curRect.width + 1,
        strokeStyle: "red",
      }),
    };
    drawStroke(modStrokeObj);
  });
};

// Update canvas size and redraw the painting
export const resize = (e) => {
  const oldScreenWidth = drwScreenPicture.width;
  // Aspect ratio 3/4 - Also check CSS
  drwScreenPicture.height = drwScreenContainer.clientHeight;
  drwScreenPicture.width = (drwScreenPicture.height * 3) / 4;
  // Save current size to variable
  curRect = drwScreenPicture.getBoundingClientRect();
  // Get new context for this size
  context = drwScreenPicture.getContext("2d");
  // Calculate new tool widths
  convertLineWidths();
  remakeDrawingTools();
  // Update current tool width
  toolOptions.lineWidth = convertLineWidth(
    toolOptions.lineWidth,
    drwScreenPicture.width,
    oldScreenWidth
  );

  // Draw saved picture using new context
  redrawPainting(drawingCoords);
};

// Resize drawing screen by js (so context would stay relevant)
window.addEventListener("resize", resize);

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
  remakeDrawingTools();

  /////////////////////////////////////////////////////////
  // Mouse
  drwScreenPicture.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    currentStroke.push(coordsToFrac(x, y));
    drawArc(e.offsetX, e.offsetY, toolOptionsToFrac(toolOptions));
  });
  drwScreenPicture.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      // drawLine( x, y, e.offsetX, e.offsetY, toolOptions);
      drawLineLocal(x, y, e.offsetX, e.offsetY, toolOptionsToFrac(toolOptions));
      x = e.offsetX;
      y = e.offsetY;
      currentStroke.push(coordsToFrac(x, y));
      // Send before it gets too big
      if (currentStroke.length >= 500) {
        // Make deep copy
        const currentStrokeCopy = JSON.parse(JSON.stringify(currentStroke));
        // Send stroke
        sendDrawingStroke(currentStrokeCopy, toolOptionsToFrac(toolOptions));
        // Also save last coordinate as first
        currentStroke = [];
        currentStroke.push(coordsToFrac(x, y));
      }
      // roleLabelEl.textContent = coordsToFrac(x, y);
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
    sendDrawingStroke(currentStrokeCopy, toolOptionsToFrac(toolOptions));
    currentStroke = [];
  });

  /////////////////////////////////////////////////////////
  // Touch
  drwScreenPicture.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    x = touch.pageX - curRect.left;
    y = touch.pageY - curRect.top;
    drawArc(x, y, toolOptionsToFrac(toolOptions));
    currentStroke.push(coordsToFrac(x, y));
  });
  drwScreenPicture.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    // drawLine(
    drawLineLocal(
      x,
      y,
      touch.pageX - curRect.left,
      touch.pageY - curRect.top,
      toolOptionsToFrac(toolOptions)
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
    sendDrawingStroke(currentStrokeCopy, toolOptionsToFrac(toolOptions));
    currentStroke = [];
  });
};

// Send coordinates to others
