// Fetches the numbers the profile shows and writes gen/data/live.json.
// Anything that fails keeps its last value, so a flaky API never blanks the page.
//   GITHUB_TOKEN=… node gen/live.mjs        (locally: GITHUB_TOKEN=$(gh auth token))
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "data", "live.json");
const LOGIN = process.env.PROFILE_LOGIN ?? "acunli";
const token = process.env.GITHUB_TOKEN;
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const live = { ...prev };

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { accept: "application/vnd.github+json", "user-agent": "profile-readme", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function step(name, fn) {
  try {
    await fn();
    console.log("ok", name);
  } catch (e) {
    console.warn("kept old", name, "-", e.message);
  }
}

await step("games reviewed", async () => {
  const res = await fetch("https://www.whatsthisposition.com/api/reviewed", { headers: { "user-agent": "profile-readme" } });
  const { games } = await res.json();
  if (!Number.isFinite(games) || games <= 0) throw new Error("no count");
  live.gamesReviewed = games;
});

await step("repos and languages", async () => {
  // The profile repo itself is left out: its generator would count as JavaScript.
  const repos = (await gh(`/users/${LOGIN}/repos?per_page=100&type=owner`)).filter((r) => !r.fork && !r.private && r.name !== LOGIN);
  live.stars = repos.reduce((n, r) => n + r.stargazers_count, 0);
  live.publicRepos = repos.length;
  const wtp = repos.find((r) => r.name === "whatsthisposition");
  if (wtp) live.wtpStars = wtp.stargazers_count;
  // "This season": repos pushed in the last 12 months. Old school projects that vendored
  // whole JS libraries would otherwise top the table.
  const since = Date.now() - 365 * 864e5;
  const season = repos.filter((r) => Date.parse(r.pushed_at) >= since);
  live.seasonRepos = season.length;
  const bytes = {};
  for (const r of season) {
    const langs = await gh(`/repos/${LOGIN}/${r.name}/languages`);
    for (const [k, v] of Object.entries(langs)) bytes[k] = (bytes[k] ?? 0) + v;
  }
  live.languages = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .map(([name, b]) => ({ name, bytes: b }));
});

await step("contributions", async () => {
  if (!token) throw new Error("needs GITHUB_TOKEN");
  const q = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "user-agent": "profile-readme" },
    body: JSON.stringify({ query: q, variables: { l: LOGIN } }),
  });
  const j = await res.json();
  const cal = j.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error(JSON.stringify(j.errors ?? j).slice(0, 200));
  live.contributions = {
    total: cal.totalContributions,
    days: cal.weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount])),
  };
});

live.updated = new Date().toISOString().slice(0, 10);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(live, null, 1) + "\n");
