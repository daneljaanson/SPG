"use strict";

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

////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////
const resize = (e) => {
  context = drwScreenPicture.getContext("2d");
  // Aspect ratio 3/4 - Also check CSS
  drwScreenPicture.height = drwScreenContainer.clientHeight;
  drwScreenPicture.width = (drwScreenPicture.height * 3) / 4;
};
resize();

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

// Resize drawing screen by js (so context would stay relevant)
window.addEventListener("resize", resize);

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

export const drawingHandlers = () => {
  /////////////////////////////////////////////////////////
  // Mouse
  drwScreenPicture.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  });
  drwScreenPicture.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
    }
  });
  window.addEventListener("mouseup", (e) => {
    isDrawing = false;
    x = 0;
    y = 0;
  });

  /////////////////////////////////////////////////////////
  // Touch
  drwScreenPicture.addEventListener("touchstart", (e) => {
    e.preventDefault();
    curRect = drwScreenPicture.getBoundingClientRect();

    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      console.log(`touchstart: ${i}.`);
      ongoingTouches.push(copyTouch(touches[i]));
      //   console.log(touches[i]);
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
    }
  });
  drwScreenPicture.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const index = ongoingTouchIndexById(touches[i].identifier);
      // Continue touch
      if (index >= 0) {
        console.log(`continuing touch: ${i}`);
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
      } else {
        console.log("cant figure out where to continue with touch");
      }
    }
  });
  drwScreenPicture.addEventListener("touchend", (e) => {
    e.preventDefault();
    console.log("touch end");
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
      } else {
        console.log("cant figure out where to continue with touch");
      }
    }
  });
};

export const drawLine = (context, x1, y1, x2, y2) => {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
};
