// server.js
// Entry point: wires up Express, CORS, and all the route modules, then starts listening.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyConnection } = require("./db");

const skillsRouter = require("./routes/skills");
const jobsRouter = require("./routes/jobs");
const roadmapRouter = require("./routes/roadmap");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/skills", skillsRouter);
app.use("/jobs", jobsRouter);
app.use("/roadmap", roadmapRouter);

app.get("/", (req, res) => res.send("SkillPath API is running"));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await verifyConnection(); // fail fast if CognoDB credentials are wrong
    app.listen(PORT, () => console.log(`SkillPath API listening on port ${PORT}`));
  } catch (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
}

start();
