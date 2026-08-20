// routes/skills.js
// Handles: GET /skills -> returns every skill name, used to fill the checkboxes on the frontend.

const express = require("express");
const router = express.Router();
const { getAllSkills } = require("../queries/skillPathQuery");

router.get("/", async (req, res) => {
  try {
    const skills = await getAllSkills();
    res.json({ skills });
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ error: "Database unavailable, please try again later" });
  }
});

module.exports = router;
