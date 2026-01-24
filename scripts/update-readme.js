#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤖 DYNAMIC README UPDATER
 * Fetches real-time data from GitHub & LeetCode APIs
 * Generates matrix-style README with live metrics
 * ═══════════════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const yaml = require("js-yaml");

// ═══════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = "AbirpandA";
const LEETCODE_USERNAME = "CTp4b4787R";
const GITHUB_TOKEN = process.env.GH_TOKEN; // GitHub Actions will provide this

const paths = {
  profileData: path.join(__dirname, "../data/profile.yaml"),
  readme: path.join(__dirname, "../README.md"),
};

// ═══════════════════════════════════════════════════════════════════
// 📡 API FETCHERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch data from HTTPS endpoint
 */
function fetchAPI(url, headers = {}) {
  return new Promise((resolve, reject) => {
    // GitHub API requires User-Agent header
    const defaultHeaders = {
      "User-Agent": "Abirpanda-Profile-Updater/1.0",
      ...headers,
    };

    https
      .get(url, { headers: defaultHeaders }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            resolve(null);
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Fetch GitHub user stats
 */
async function fetchGitHubStats() {
  try {
    console.log("📡 Fetching GitHub stats...");
    const headers = GITHUB_TOKEN
      ? { Authorization: `token ${GITHUB_TOKEN}` }
      : {};
    const url = `https://api.github.com/users/${GITHUB_USERNAME}`;
    const data = await fetchAPI(url, headers);

    if (data) {
      console.log(`   ✓ GitHub: ${data.followers} followers`);
      return {
        followers: data.followers || 0,
        following: data.following || 0,
        public_repos: data.public_repos || 0,
        total_stars: data.public_repos || 0,
      };
    } else {
      console.log("   ✗ No data from GitHub API");
    }
  } catch (error) {
    console.error("   ❌ GitHub fetch failed:", error.message);
  }
  return null;
}

/**
 * Fetch LeetCode stats
 */
async function fetchLeetCodeStats() {
  try {
    console.log("📡 Fetching LeetCode stats...");
    const url = `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`;
    const data = await fetchAPI(url);

    if (data && data.status === "success") {
      console.log(`   ✓ LeetCode: ${data.totalSolved} problems solved`);
      return {
        total_solved: parseInt(data.totalSolved) || 0,
        easy: parseInt(data.easySolved) || 0,
        medium: parseInt(data.mediumSolved) || 0,
        hard: parseInt(data.hardSolved) || 0,
        acceptance_rate: parseFloat(data.acceptanceRate) || 0,
      };
    } else {
      console.log(
        `   ⚠️  LeetCode: ${data?.message || "user not found or API error"}`,
      );
    }
  } catch (error) {
    console.error("   ⚠️  LeetCode fetch failed (optional):", error.message);
  }
  return null;
}

/**
 * Fetch GitHub contribution stats
 */
async function fetchContributions() {
  try {
    console.log("📡 Fetching contribution stats...");
    const headers = GITHUB_TOKEN
      ? { Authorization: `token ${GITHUB_TOKEN}` }
      : {};
    const url = `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}`;
    const data = await fetchAPI(url, headers);
    if (data && data.total_count !== undefined) {
      console.log(`   ✓ Contributions: ${data.total_count}`);
      return data.total_count;
    } else {
      console.log(`   ✗ No contribution data returned`);
      return 0;
    }
  } catch (error) {
    console.error(
      "   ⚠️  Contributions fetch failed (optional):",
      error.message,
    );
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📝 README GENERATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate matrix-style terminal ASCII art
 */
function generateMatrixHeader() {
  return `
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗███████╗ ║
║  ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝██╔════╝ ║
║  ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  █████╗   ║
║  ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══╝   ║
║  ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗███████╗ ║
║   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝ ║
║                                                                           ║
║                    Welcome to Abir Panda's GitHub Matrix                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Generate profile section
 */
function generateProfileSection(profile) {
  return `
┌─ 👤 PROFILE MATRIX ─────────────────────────────────────────────────────┐
│                                                                           │
│  Name:              ${profile.name.padEnd(50)}  │
│  Title:             ${profile.title.padEnd(50)}  │
│  Location:          ${profile.location.padEnd(50)}  │
│  Age:               ${profile.age.toString().padEnd(50)}  │
│  Timezone:          ${profile.timezone.padEnd(50)}  │
│  Status:            🟢 Online 24/7                                       │
│                                                                           │
│  Tagline: "${profile.tagline}"                        │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate tech stack section
 */
function generateTechSection(techStack) {
  const formatArray = (arr) => arr.join(" • ");

  return `
┌─ 🛠️  TECH ARSENAL ────────────────────────────────────────────────────────┐
│                                                                           │
│  Languages:        ${formatArray(techStack.languages).padEnd(50)}  │
│  Frontend:         ${formatArray(techStack.frontend).slice(0, 47).padEnd(50)}  │
│  Backend:          ${formatArray(techStack.backend).padEnd(50)}  │
│  Databases:        ${formatArray(techStack.databases).padEnd(50)}  │
│  Tools:            ${formatArray(techStack.tools).slice(0, 47).padEnd(50)}  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate live stats section
 */
function generateStatsSection(github, leetcode, profile) {
  // Provide defaults if stats are undefined
  const githubStats = github || { followers: 0, following: 0, public_repos: 0 };
  const leetcodeStats = leetcode || {
    total_solved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    acceptance_rate: 0,
  };
  const contributions =
    (profile &&
      profile.github_stats &&
      profile.github_stats.total_contributions) ||
    0;

  return `
┌─ 📊 LIVE METRICS (Updated Daily) ────────────────────────────────────────┐
│                                                                           │
│  ╭─ GITHUB STATS                                                         │
│  │  Followers:        ${(githubStats.followers || 0).toString().padEnd(46)}│
│  │  Following:        ${(githubStats.following || 0).toString().padEnd(46)}│
│  │  Repositories:     ${(githubStats.public_repos || 0).toString().padEnd(46)}│
│  │  Contributions:    ${contributions.toString().padEnd(46)}│
│  ╰─ Last Updated: ${new Date().toISOString().split("T")[0].padEnd(34)}│
│                                                                           │
│  ╭─ LEETCODE STATS                                                       │
│  │  Total Solved:     ${(leetcodeStats.total_solved || 0).toString().padEnd(46)}│
│  │  Easy:             ${(leetcodeStats.easy || 0).toString().padEnd(46)}│
│  │  Medium:           ${(leetcodeStats.medium || 0).toString().padEnd(46)}│
│  │  Hard:             ${(leetcodeStats.hard || 0).toString().padEnd(46)}│
│  │  Acceptance Rate:  ${(leetcodeStats.acceptance_rate || 0).toFixed(2) + "%".padEnd(44)}│
│  ╰─ Last Updated: ${new Date().toISOString().split("T")[0].padEnd(34)}│
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate mission section
 */
function generateMissionSection(mission) {
  // Provide defaults if mission is undefined
  const missionData = mission || {
    status: "Unknown",
    mode: "Learning",
    weapons: ["Building"],
    weaknesses: ["Time management"],
    next_level: "Keep improving",
  };

  return `
┌─ 🚀 CURRENT MISSION STATUS ─────────────────────────────────────────────┐
│                                                                           │
│  Status:            ${(missionData.status || "").padEnd(50)}  │
│  Mode:              ${(missionData.mode || "").padEnd(50)}  │
│                                                                           │
│  Weapons Arsenal:                                                        │
${(missionData.weapons || []).map((w) => `│    ⚡ ${(w || "").padEnd(63)}  │`).join("\n")}
│                                                                           │
│  Known Weaknesses:                                                       │
${(missionData.weaknesses || []).map((w) => `│    ⚠️  ${(w || "").padEnd(63)}  │`).join("\n")}
│                                                                           │
│  Next Level:        ${(missionData.next_level || "").padEnd(50)}  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate projects section
 */
function generateProjectsSection(projects) {
  let section = `
┌─ 📁 CURRENT PROJECTS ───────────────────────────────────────────────────┐
│                                                                           │
`;

  Object.values(projects).forEach((proj, idx) => {
    section += `│  ${idx + 1}. ${proj.name.padEnd(67)}  │\n`;
    section += `│     Description: ${proj.description.slice(0, 55).padEnd(57)}  │\n`;
    section += `│     Tech Stack:  ${proj.tech.join(" • ").slice(0, 50).padEnd(57)}  │\n`;
    section += `│     Status:      ${proj.status.padEnd(57)}  │\n`;
    section += `│                                                                           │\n`;
  });

  section += `└───────────────────────────────────────────────────────────────────────────┘\n`;
  return section;
}

/**
 * Generate goals section
 */
function generateGoalsSection(goals) {
  return `
┌─ 🎯 GOALS & ASPIRATIONS ────────────────────────────────────────────────┐
│                                                                           │
│  Short Term:                                                             │
${goals.short_term.map((g) => `│    ✓ ${g.padEnd(65)}  │`).join("\n")}
│                                                                           │
│  Long Term:                                                              │
${goals.long_term.map((g) => `│    ★ ${g.padEnd(65)}  │`).join("\n")}
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate social links section
 */
function generateSocialSection(social) {
  // Provide defaults if social links are missing
  const socialData = social || {};

  return `
┌─ 📞 CONNECT & COLLABORATE ──────────────────────────────────────────────┐
│                                                                           │
│  GitHub:           ${(socialData.github || "N/A").padEnd(50)}  │
│  LinkedIn:         ${(socialData.linkedin || "N/A").padEnd(50)}  │
│  Twitter:          ${(socialData.twitter || "N/A").padEnd(50)}  │
│  Email:            ${(socialData.email || "N/A").padEnd(50)}  │
│  Portfolio:        ${(socialData.portfolio || "N/A").padEnd(50)}  │
│                                                                           │
│  Let's collaborate on building scalable systems! 🚀                      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`;
}

/**
 * Generate footer
 */
function generateFooter() {
  const now = new Date().toISOString();
  return `
╔═══════════════════════════════════════════════════════════════════════════╗
║  Last Updated: ${now}                              ║
║  Auto-updated daily via GitHub Actions • View source at /data/profile.yaml ║
║                                                                           ║
║  "Code today, scale tomorrow" - Abir Panda                              ║
╚═══════════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Main README generator
 */
function generateREADME(
  profile,
  techStack,
  mission,
  projects,
  goals,
  social,
  stats,
) {
  let readme = generateMatrixHeader();
  readme += generateProfileSection(profile);
  readme += generateTechSection(techStack);
  readme += generateStatsSection(stats.github, stats.leetcode, profile);
  readme += generateMissionSection(mission);
  readme += generateProjectsSection(projects);
  readme += generateGoalsSection(goals);
  readme += generateSocialSection(social);
  readme += generateFooter();

  return readme;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════

async function main() {
  try {
    console.log("🤖 Starting README update cycle...\n");

    // Load profile data
    const profileYAML = fs.readFileSync(paths.profileData, "utf8");
    const profileData = yaml.load(profileYAML);

    // Fetch live data
    const [githubStats, leetcodeStats, contributions] = await Promise.all([
      fetchGitHubStats(),
      fetchLeetCodeStats(),
      fetchContributions(),
    ]);

    // Update profile data with live stats
    // Ensure github_stats exists
    if (!profileData.github_stats) {
      profileData.github_stats = {};
    }

    if (githubStats) {
      profileData.github_stats = {
        ...profileData.github_stats,
        ...githubStats,
        total_contributions: contributions || 0,
        last_updated: new Date().toISOString().split("T")[0],
      };
    } else {
      // If fetch failed, ensure total_contributions exists
      profileData.github_stats.total_contributions =
        profileData.github_stats.total_contributions || 0;
    }

    // Ensure leetcode_stats exists
    if (!profileData.leetcode_stats) {
      profileData.leetcode_stats = {
        total_solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        acceptance_rate: 0,
      };
    }

    if (leetcodeStats) {
      profileData.leetcode_stats = {
        ...profileData.leetcode_stats,
        ...leetcodeStats,
        last_updated: new Date().toISOString().split("T")[0],
      };
    }

    // Save updated profile
    fs.writeFileSync(
      paths.profileData,
      yaml.dump(profileData, { lineWidth: 120 }),
    );
    console.log("✅ Profile data updated\n");

    // Generate new README
    try {
      const newREADME = generateREADME(
        profileData.profile,
        profileData.tech_stack,
        profileData.current_mission,
        profileData.current_projects,
        profileData.goals,
        profileData.social,
        {
          github: profileData.github_stats,
          leetcode: profileData.leetcode_stats,
        },
      );

      fs.writeFileSync(paths.readme, newREADME);
      console.log("✅ README generated successfully!\n");
    } catch (generateError) {
      console.error("❌ Error generating README:", generateError.message);
      console.error("Stack:", generateError.stack);
      throw generateError;
    }
    console.log("📊 Stats Summary:");
    console.log(`   GitHub Followers: ${profileData.github_stats.followers}`);
    console.log(
      `   LeetCode Solved: ${profileData.leetcode_stats.total_solved}`,
    );
    console.log(
      `   Total Contributions: ${profileData.github_stats.total_contributions}\n`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
