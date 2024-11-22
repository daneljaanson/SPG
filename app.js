const express = require("express");
const cors = require("cors");
const xss = require("xss-clean");
const gameRouter = require("./routes/gameRouter");
const path = require("path");
const morgan = require("morgan");

const app = express();

//SET PATH FOR ALL VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//GLOBAL MW
// Prevent XSS attacks (html)
app.use(xss());
// Implement CORS (will add some headers to allow cross-origin requests)
app.use(cors());

//will get requested by the browser (for non-simple requests) in the "pre-flight phase"
app.options("*", cors());

//DEV LOGGING
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//BODY AVAILABLE IN REQ.BODY
app.use(express.json({ limit: "10kb" }));
app.use(express.json({ extended: true, limit: "10kb" }));

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/", gameRouter);

//CATCH UNDEFINED ROUTES
app.all("*", (req, res, next) => {
  res.status(404).send(`${req.originalUrl} not found!`);
});

module.exports = app;
