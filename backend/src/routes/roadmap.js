// routes/roadmap.js
// Handles: POST /roadmap -> takes { knownSkills, jobTitle }, returns the learning path.

const express = require("express");
const router = express.Router();
const { findLearningPath } = require("../queries/skillPathQuery");

router.post("/", async (req, res) => {
  const { knownSkills, jobTitle } = req.body;

  // Basic input validation - never trust what the client sends.
  if (!jobTitle || typeof jobTitle !== "string") {
    return res.status(400).json({ error: "jobTitle is required" });
  }
  if (!Array.isArray(knownSkills)) {
    return res.status(400).json({ error: "knownSkills must be an array" });
  }

  try {
    const result = await findLearningPath(knownSkills, jobTitle);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ error: "Database unavailable, please try again later" });
  }
});

module.exports = router;
