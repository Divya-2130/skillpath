// routes/jobs.js
// Handles: GET /jobs -> returns every job title, used to fill the dropdown on the frontend.

const express = require("express");
const router = express.Router();
const { getAllJobs } = require("../queries/skillPathQuery");

router.get("/", async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.json({ jobs });
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ error: "Database unavailable, please try again later" });
  }
});

module.exports = router;
