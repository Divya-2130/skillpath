// db.js
// This file's only job: open ONE connection to CognoDB and share it with the rest of the app.

require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

// Call this once when the server starts, to fail fast if credentials are wrong.
async function verifyConnection() {
  try {
    await driver.verifyConnectivity();
    console.log("Connected to CognoDB successfully");
  } catch (err) {
    console.error("Could not connect to CognoDB:", err.message);
    throw err;
  }
}

// Every query needs a "session" borrowed from the driver.
function getSession() {
  return driver.session();
}

async function closeConnection() {
  await driver.close();
}

module.exports = { driver, getSession, verifyConnection, closeConnection };
