// skillPathQuery.js
// This is the "brain" of the app: it asks CognoDB for the missing skills
// and the shortest learning order between what the user knows and what the job needs.

const { getSession } = require("../db");

async function getAllSkills() {
  const session = getSession();
  try {
    const result = await session.run("MATCH (s:Skill) RETURN s.name AS name ORDER BY s.name");
    return result.records.map((r) => r.get("name"));
  } finally {
    await session.close();
  }
}

async function getAllJobs() {
  const session = getSession();
  try {
    const result = await session.run("MATCH (j:Job) RETURN j.title AS title ORDER BY j.title");
    return result.records.map((r) => r.get("title"));
  } finally {
    await session.close();
  }
}

// knownSkills: array of skill names the user already has, e.g. ["HTML", "JavaScript"]
// jobTitle: the target job, e.g. "Frontend Developer"
async function findLearningPath(knownSkills, jobTitle) {
  const session = getSession();
  try {
    // Step 1: find every skill the target job requires that is NOT already known.
    const missingResult = await session.run(
      `MATCH (j:Job {title: $jobTitle})-[:REQUIRES]->(needed:Skill)
       WHERE NOT needed.name IN $knownSkills
       RETURN needed.name AS name`,
      { jobTitle, knownSkills }
    );
    const missingSkills = missingResult.records.map((r) => r.get("name"));

    if (missingSkills.length === 0) {
      return { job: jobTitle, missingSkills: [], order: [], message: "You already have all the required skills!" };
    }

    // Step 2: for each missing skill, find the shortest prerequisite chain
    // from anything the user already knows. This is the multi-hop traversal.
    const pathResult = await session.run(
      `MATCH (needed:Skill)
       WHERE needed.name IN $missingSkills
       MATCH path = shortestPath(
         (known:Skill)-[:PREREQUISITE_OF*0..6]->(needed)
       )
       WHERE known.name IN $knownSkills OR known = needed
       RETURN needed.name AS target, [n IN nodes(path) | n.name] AS chain
       ORDER BY length(path)`,
      { missingSkills, knownSkills }
    );

    // Step 3: flatten all the chains into one ordered, de-duplicated learning list.
    const order = [];
    for (const record of pathResult.records) {
      const chain = record.get("chain");
      for (const skillName of chain) {
        if (!knownSkills.includes(skillName) && !order.includes(skillName)) {
          order.push(skillName);
        }
      }
    }

    return { job: jobTitle, missingSkills, order };
  } finally {
    await session.close();
  }
}

module.exports = { getAllSkills, getAllJobs, findLearningPath };
