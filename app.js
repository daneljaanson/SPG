const express = require("express");
const gameRouter = require("./routes/gameRouter");
const path = require("path");

const app = express();

//SET PATH FOR ALL VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//DEV LOGGING
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//BODY AVAILABLE IN REQ.BODY
app.use(express.json({ limit: "10kb" }));
app.use(express.json({ extended: true, limit: "10kb" }));

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/play", gameRouter);
app.route("/").get((req, res, next) =>
  res.status(200).render("base", {
    status: "success",
    data: "heyo",
  })
);

//CATCH UNDEFINED ROUTES
app.all("*", (req, res, next) => {
  res.status(404).send(`${req.originalUrl} not found!`);
});

module.exports = app;
