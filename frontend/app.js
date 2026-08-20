// app.js
// Handles all the frontend logic: loading skills/jobs, and requesting the roadmap.

const API_BASE = "http://localhost:4000"; // change this after you deploy the backend

const skillsListEl = document.getElementById("skills-list");
const jobSelectEl = document.getElementById("job-select");
const generateBtn = document.getElementById("generate-btn");
const resultEl = document.getElementById("result");

// Runs as soon as the page loads.
async function init() {
  try {
    const [skillsRes, jobsRes] = await Promise.all([
      fetch(`${API_BASE}/skills`),
      fetch(`${API_BASE}/jobs`)
    ]);
    const skillsData = await skillsRes.json();
    const jobsData = await jobsRes.json();

    renderSkillCheckboxes(skillsData.skills);
    renderJobOptions(jobsData.jobs);
  } catch (err) {
    skillsListEl.innerHTML = `<p class="error">Could not load data. Is the backend running?</p>`;
  }
}

function renderSkillCheckboxes(skills) {
  if (!skills.length) {
    skillsListEl.innerHTML = `<p>No skills found. Did you run the seed script?</p>`;
    return;
  }
  skillsListEl.innerHTML = skills
    .map(
      (name) => `
      <label>
        <input type="checkbox" value="${name}" class="skill-checkbox" />
        ${name}
      </label>`
    )
    .join("");
}

function renderJobOptions(jobs) {
  jobSelectEl.innerHTML =
    `<option value="">-- choose a job --</option>` +
    jobs.map((title) => `<option value="${title}">${title}</option>`).join("");
}

async function generateRoadmap() {
  const knownSkills = Array.from(document.querySelectorAll(".skill-checkbox:checked")).map(
    (el) => el.value
  );
  const jobTitle = jobSelectEl.value;

  if (!jobTitle) {
    alert("Please choose a target job first.");
    return;
  }

  resultEl.classList.remove("hidden");
  resultEl.innerHTML = `<p class="loading">Generating your roadmap...</p>`;
  generateBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ knownSkills, jobTitle })
    });
    const data = await res.json();

    if (!res.ok) {
      resultEl.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }
    renderResult(data);
  } catch (err) {
    resultEl.innerHTML = `<p class="error">Something went wrong. Please try again.</p>`;
  } finally {
    generateBtn.disabled = false;
  }
}

function renderResult(data) {
  if (data.order.length === 0) {
    resultEl.innerHTML = `<p>${data.message || "You already have all the required skills!"}</p>`;
    return;
  }
  const steps = data.order
    .map((skill, i) => `<div class="step">${i + 1}. Learn ${skill}</div>`)
    .join("");
  resultEl.innerHTML = `<h2>Your roadmap to become a ${data.job}</h2>${steps}`;
}

generateBtn.addEventListener("click", generateRoadmap);
init();
