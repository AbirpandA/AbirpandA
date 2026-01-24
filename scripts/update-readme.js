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

// Global constants for consistent box formatting
const CONTENT_WIDTH = 73;

// Helper: Create a row with consistent padding
const createRow = (content = "") => {
  return `│${content.padEnd(CONTENT_WIDTH)}│`;
};

// Helper: Create a labeled row (label: value)
const labelRow = (label, value, labelWidth = 18) => {
  const content = `  ${label.padEnd(labelWidth)}${String(value)}`;
  return createRow(content);
};

// Helper: Create section header
const sectionHeader = (emoji, title) => {
  const headerText = `─ ${emoji} ${title} `;
  return `┌${headerText}${"─".repeat(CONTENT_WIDTH - headerText.length )}┐`;
};

// Helper: Create section footer
const sectionFooter = () => `└${"─".repeat(CONTENT_WIDTH)}┘`;

// Helper: Create double-line header (for main header/footer)
const doubleHeader = () => `╔${"═".repeat(CONTENT_WIDTH)}╗`;
const doubleFooter = () => `╚${"═".repeat(CONTENT_WIDTH)}╝`;
const doubleRow = (content = "") => `║${content.padEnd(CONTENT_WIDTH)}║`;

/**
 * Generate matrix-style terminal ASCII art
 */
function generateMatrixHeader() {
  return `
${doubleHeader()}
${doubleRow("")}
${doubleRow("  ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗███████╗")}
${doubleRow("  ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝██╔════╝")}
${doubleRow("  ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  █████╗")}
${doubleRow("  ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══╝")}
${doubleRow("  ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗███████╗")}
${doubleRow("   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝")}
${doubleRow("")}
${doubleRow("                    Welcome to Abir Panda's GitHub Matrix")}
${doubleRow("")}
${doubleFooter()}
`;
}

/**
 * Generate profile section
 */
function generateProfileSection(profile) {
  return `
${sectionHeader("👤", "PROFILE MATRIX")}
${createRow("")}
${labelRow("Name:", profile.name)}
${labelRow("Title:", profile.title)}
${labelRow("Location:", profile.location)}
${labelRow("Age:", profile.age)}
${labelRow("Timezone:", profile.timezone)}
${labelRow("Status:", "🟢 Online 24/7")}
${createRow("")}
${createRow(`  Tagline: "${profile.tagline}"`)}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate tech stack section
 */
function generateTechSection(techStack) {
  const formatArray = (arr) => arr.join(" • ");

  return `
${sectionHeader("🛠️ ", "TECH ARSENAL")}
${createRow("")}
${labelRow("Languages:", formatArray(techStack.languages))}
${labelRow("Frontend:", formatArray(techStack.frontend))}
${labelRow("Backend:", formatArray(techStack.backend))}
${labelRow("Databases:", formatArray(techStack.databases))}
${labelRow("Tools:", formatArray(techStack.tools))}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate live stats section
 */
function generateStatsSection(github, leetcode, profile) {
  const gh = github || { followers: 0, following: 0, public_repos: 0 };
  const lc = leetcode || {
    total_solved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    acceptance_rate: 0,
  };
  const contributions = profile?.github_stats?.total_contributions || 0;
  const date = new Date().toISOString().split("T")[0];

  const statRow = (label, value) => {
    const content = `  │  ${label.padEnd(18)}${String(value)}`;
    return createRow(content);
  };

  return `
${sectionHeader("📊", "LIVE METRICS (Updated Daily)")}
${createRow("")}
${createRow("  ╭─ GITHUB STATS")}
${statRow("Followers:", gh.followers || 0)}
${statRow("Following:", gh.following || 0)}
${statRow("Repositories:", gh.public_repos || 0)}
${statRow("Contributions:", contributions)}
${createRow(`  ╰─ Last Updated: ${date}`)}
${createRow("")}
${createRow("  ╭─ LEETCODE STATS")}
${statRow("Total Solved:", lc.total_solved || 0)}
${statRow("Easy:", lc.easy || 0)}
${statRow("Medium:", lc.medium || 0)}
${statRow("Hard:", lc.hard || 0)}
${statRow("Acceptance Rate:", (lc.acceptance_rate || 0).toFixed(2) + "%")}
${createRow(`  ╰─ Last Updated: ${date}`)}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate mission section
 */
function generateMissionSection(mission) {
  const m = mission || {
    status: "Unknown",
    mode: "Learning",
    weapons: [],
    weaknesses: [],
    next_level: "Keep improving",
  };

  const weaponRows = (m.weapons || [])
    .map((w) => createRow(`    ⚡ ${w}`))
    .join("\n");
  const weaknessRows = (m.weaknesses || [])
    .map((w) => createRow(`    ⚠️  ${w}`))
    .join("\n");

  return `
${sectionHeader("🚀", "CURRENT MISSION STATUS")}
${createRow("")}
${labelRow("Status:", m.status || "")}
${labelRow("Mode:", m.mode || "")}
${createRow("")}
${createRow("  Weapons Arsenal:")}
${weaponRows}
${createRow("")}
${createRow("  Known Weaknesses:")}
${weaknessRows}
${createRow("")}
${labelRow("Next Level:", m.next_level || "")}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate projects section
 */
function generateProjectsSection(projects) {
  let rows = [];

  Object.values(projects).forEach((proj, idx) => {
    rows.push(createRow(`  ${idx + 1}. ${proj.name}`));
    rows.push(createRow(`     Description: ${proj.description}`));
    rows.push(createRow(`     Tech Stack:  ${proj.tech.join(" • ")}`));
    rows.push(createRow(`     Status:      ${proj.status}`));
    rows.push(createRow(""));
  });

  return `
${sectionHeader("📁", "CURRENT PROJECTS")}
${createRow("")}
${rows.join("\n")}
${sectionFooter()}
`;
}

/**
 * Generate goals section
 */
function generateGoalsSection(goals) {
  const shortTermRows = goals.short_term
    .map((g) => createRow(`    ✓ ${g}`))
    .join("\n");
  const longTermRows = goals.long_term
    .map((g) => createRow(`    ★ ${g}`))
    .join("\n");

  return `
${sectionHeader("🎯", "GOALS & ASPIRATIONS")}
${createRow("")}
${createRow("  Short Term:")}
${shortTermRows}
${createRow("")}
${createRow("  Long Term:")}
${longTermRows}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate social links section
 */
function generateSocialSection(social) {
  const s = social || {};

  return `
${sectionHeader("📞", "CONNECT & COLLABORATE")}
${createRow("")}
${labelRow("GitHub:", s.github || "N/A")}
${labelRow("LinkedIn:", s.linkedin || "N/A")}
${labelRow("Twitter:", s.twitter || "N/A")}
${labelRow("Email:", s.email || "N/A")}
${labelRow("Portfolio:", s.portfolio || "N/A")}
${createRow("")}
${createRow("  Let's collaborate on building scalable systems! 🚀")}
${createRow("")}
${sectionFooter()}
`;
}

/**
 * Generate footer
 */
function generateFooter() {
  const now = new Date().toISOString();

  return `
${doubleHeader()}
${doubleRow(`  Last Updated: ${now}`)}
${doubleRow("  Auto-updated daily via GitHub Actions •")}
${doubleRow("")}
${doubleRow('  "Code today, scale tomorrow" - Abir Panda')}
${doubleFooter()}
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
  let readme = "```yml\n";
  readme += generateMatrixHeader();
  readme += generateProfileSection(profile);
  readme += generateTechSection(techStack);
  readme += generateStatsSection(stats.github, stats.leetcode, profile);
  readme += generateMissionSection(mission);
  readme += generateProjectsSection(projects);
  readme += generateGoalsSection(goals);
  readme += generateSocialSection(social);
  readme += generateFooter();
  readme += "\n```";

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
