// seed.js
// Run once with: npm run seed
// Wipes the database clean and loads sample skills, jobs, and their connections.

const { getSession, closeConnection, verifyConnection } = require("./db");

const skills = [
  "HTML", "CSS", "JavaScript", "React", "Redux",
  "Node.js", "Express", "SQL", "Git", "REST APIs"
];

// Each entry means: fromSkill -> is a prerequisite of -> toSkill
const prerequisites = [
  ["HTML", "CSS"],
  ["CSS", "JavaScript"],
  ["JavaScript", "React"],
  ["React", "Redux"],
  ["JavaScript", "Node.js"],
  ["Node.js", "Express"],
  ["Git", "React"],
  ["REST APIs", "Express"]
];

const jobs = [
  { title: "Frontend Developer", requires: ["HTML", "CSS", "JavaScript", "React", "Redux"] },
  { title: "Backend Developer", requires: ["JavaScript", "Node.js", "Express", "SQL", "REST APIs"] }
];

async function seed() {
  await verifyConnection();
  const session = getSession();
  try {
    // 1. Clear old data so re-running this script is always safe.
    await session.run("MATCH (n) DETACH DELETE n");

    // 2. Create every skill as its own node.
    for (const name of skills) {
      await session.run("CREATE (:Skill {name: $name})", { name });
    }

    // 3. Connect skills that are prerequisites of other skills.
    for (const [from, to] of prerequisites) {
      await session.run(
        `MATCH (a:Skill {name: $from}), (b:Skill {name: $to})
         CREATE (a)-[:PREREQUISITE_OF]->(b)`,
        { from, to }
      );
    }

    // 4. Create job nodes and connect them to the skills they require.
    for (const job of jobs) {
      await session.run("CREATE (:Job {title: $title})", { title: job.title });
      for (const skillName of job.requires) {
        await session.run(
          `MATCH (j:Job {title: $title}), (s:Skill {name: $skillName})
           CREATE (j)-[:REQUIRES]->(s)`,
          { title: job.title, skillName }
        );
      }
    }

    console.log(`Seeded ${skills.length} skills, ${jobs.length} jobs, ${prerequisites.length} prerequisite links`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await session.close();
    await closeConnection();
  }
}

seed();
