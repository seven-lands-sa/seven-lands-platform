import fs from "node:fs";
import { execSync } from "node:child_process";

async function main() {
  const token = fs.readFileSync("scripts/browser-actions/.token.tmp", "utf-8").trim();
  if (!token) throw new Error("Token not found");

  console.log("Checking GitHub user...");
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "Seven-Lands-DevOps",
      Accept: "application/vnd.github+json"
    }
  });

  const userData = await userRes.json();
  console.log(`Authenticated as GitHub user: ${userData.login} (Type: ${userData.type})`);

  console.log("Creating private repository 'seven-lands-platform'...");
  const createRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "Seven-Lands-DevOps",
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "seven-lands-platform",
      description: "Official enterprise platform for Seven Lands / سفن لاند (Bilingual Next.js / Payload CMS)",
      private: true,
      has_issues: true,
      has_projects: false,
      has_wiki: false
    })
  });

  const repoData = await createRes.json();
  if (createRes.status === 201) {
    console.log(`Repository created successfully: ${repoData.html_url} (Private: ${repoData.private})`);
  } else if (createRes.status === 422 && JSON.stringify(repoData).includes("already exists")) {
    console.log("Repository already exists on this account. Proceeding with existing repo.");
  } else {
    throw new Error(`Failed to create repository: ${JSON.stringify(repoData)}`);
  }

  // Configure git remote
  console.log("Configuring git remote 'origin'...");
  try {
    execSync("git remote remove origin", { stdio: "ignore" });
  } catch {}

  const authRemoteUrl = `https://seven-lands-sa:${token}@github.com/seven-lands-sa/seven-lands-platform.git`;
  execSync(`git remote add origin ${authRemoteUrl}`);

  console.log("Pushing 'master' branch to origin...");
  execSync("git push -u origin master", { stdio: "inherit" });

  console.log("Pushing 'v1.0.0-rc.1' tag to origin...");
  execSync("git push origin v1.0.0-rc.1", { stdio: "inherit" });

  // Sanitize remote URL so token is not saved in .git/config
  const cleanRemoteUrl = "https://github.com/seven-lands-sa/seven-lands-platform.git";
  execSync(`git remote set-url origin ${cleanRemoteUrl}`);
  console.log(`Remote 'origin' sanitized to: ${cleanRemoteUrl}`);

  // Delete temp token file
  fs.unlinkSync("scripts/browser-actions/.token.tmp");
  console.log("Removed temporary token file. REPO ESTABLISHED SUCCESSFULLY!");
}

main().catch(err => {
  console.error("Error in create-and-push-repo:", err);
  process.exit(1);
});
