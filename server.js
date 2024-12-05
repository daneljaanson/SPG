const dotenv = require("dotenv");
const https = require("https");
const http = require("http");

dotenv.config({ path: "./config.env" });

const app = require("./app");

//////////////////////////////////////////////
// START SERVER

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Server running. (port ${port})`)
);
// const server = https
//   .createServer(app)
//   .listen(443, () => console.log(`Server running. (port ${port})`));

// Shut down on non-express error.
// process.on("unhandledRejection", (err) => {
//   console.log("🧅 UNHANDLED REJECTION 🧅 SHUTTING DOWN 🧅");
//   console.log(err.name, err.message);
//   server.close(() => process.exit(1));
// });
