const express = require("express");
const cors = require("cors");
const xss = require("xss-clean");
const gameRouter = require("./routes/gameRouter.js");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controllers/errorController.js");

const app = express();

//SET PATH FOR ALL VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//GLOBAL MW
// Prevent XSS attacks (html)
app.use(xss());
// Implement CORS (will add some headers to allow cross-origin requests)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//will get requested by the browser (for non-simple requests) in the "pre-flight phase"
app.options("*", cors());

//DEV LOGGING
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//BODY AVAILABLE IN REQ.BODY
app.use(express.json({ limit: "10kb" }));
app.use(express.json({ extended: true, limit: "10kb" }));

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

//SET SECURITY HTTP HEADERS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "192.168.1.149:3000/js/",
          "192.168.1.149:3000/",
        ],

        upgradeInsecureRequests: null,
      },
    },
  })
);
//ROUTES
app.use("/", gameRouter);

//CATCH UNDEFINED ROUTES
app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} not found!`, 404, true));
});

// Gets used automatically as error handler as it can take 4 args
app.use(globalErrorHandler);

module.exports = app;
