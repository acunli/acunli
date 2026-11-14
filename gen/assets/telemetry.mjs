// Telemetry: a timing tower of languages and a year of contributions as a speed trace.
// Both come from the GitHub API (gen/live.mjs), refreshed daily.
import { C, Doc, panel, r2 } from "../lib.mjs";

const LANG = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5", HTML: "#e34c26", CSS: "#663399",
  Shell: "#89e051", Dockerfile: "#384d54", Makefile: "#427819", "C++": "#f34b7d", Java: "#b07219",
  Go: "#00ADD8", Rust: "#dea584", "Jupyter Notebook": "#DA5B0B", SQL: "#e38c00", C: "#555555",
};

export function telemetry(live) {
  const W = 1000;
  const H = 432;
  const langs = live.languages.slice(0, 8);
  const total = live.languages.reduce((n, l) => n + l.bytes, 0);
  const cal = live.contributions;
  const d = new Doc(W, H, {
    title: "Telemetry",
    desc: `Languages this season: ${langs.map((l) => `${l.name} ${((l.bytes / total) * 100).toFixed(1)}%`).join(", ")}. ${cal.total} contributions in the last year.`,
  });
  const o = [panel(d)];

  // ---- timing tower ----
  const TX = 40;
  const TW = 330;
  o.push(d.text("TIMING TOWER", { face: "monoBold", size: 12, x: TX, y: 50, fill: C.papaya, ls: 0.12 }).svg);
  o.push(d.text(`Languages in the ${live.seasonRepos} repos pushed in the last 12 months`, { face: "grotesk", size: 13, x: TX, y: 72, fill: C.dim }).svg);
  const RH = 37;
  const Y0 = 92;
  // Grid order is alphabetical; the race sorts it out.
  const grid = [...langs].sort((a, b) => a.name.localeCompare(b.name)).map((l) => l.name);
  d.css.push(`.bar{transform-box:fill-box;transform-origin:0 50%}`);
  langs.forEach((l, i) => {
    const g = grid.indexOf(l.name);
    const dy = (g - i) * RH;
    const k = `tw${i}`;
    const t0 = 0.8 + Math.abs(g - i) * 0.05;
    d.css.push(
      `.${k}{animation:${k} 1.4s cubic-bezier(.65,0,.35,1) ${r2(t0)}s both}@keyframes ${k}{from{transform:translateY(${dy}px)}to{transform:none}}`,
      `.${k}b{animation:${k}b 1.6s cubic-bezier(.16,1,.3,1) ${r2(t0 + 0.9)}s both}@keyframes ${k}b{from{transform:scaleX(0)}to{transform:scaleX(1)}}`,
    );
    const share = l.bytes / total;
    const y = Y0 + i * RH;
    const col = LANG[l.name] ?? C.paper;
    const lead = i === 0;
    o.push(`<g class="${k}">
<rect x="${TX}" y="${y}" width="${TW}" height="${RH - 5}" rx="6" fill="${lead ? "#1d1d24" : "#141419"}" stroke="${lead ? C.papaya : C.hair}" stroke-opacity="${lead ? 0.6 : 1}"/>
<rect class="bar ${k}b" x="${TX + 1}" y="${y + 1}" width="${r2(Math.max(2, (TW - 2) * share))}" height="${RH - 7}" rx="5" fill="${col}" opacity=".16"/>
<rect x="${TX}" y="${y}" width="34" height="${RH - 5}" rx="6" fill="${lead ? C.papaya : C.paper}"/>
${d.text(String(i + 1), { face: "anton", size: 19, x: TX + 17, y: y + 24, anchor: "middle", fill: C.ink }).svg}
<rect x="${TX + 44}" y="${y + 8}" width="4" height="${RH - 21}" rx="2" fill="${col}"/>
${d.text(l.name, { face: "groteskBold", size: 15, x: TX + 58, y: y + 21.5, fill: C.paper }).svg}
${d.text(share >= 0.001 ? `${(share * 100).toFixed(1)}%` : "<0.1%", { face: "mono", size: 13, x: TX + TW - 12, y: y + 21, anchor: "end", fill: lead ? C.papaya : C.dim }).svg}
</g>`);
  });

  // ---- contributions ----
  const PX = 410;
  const PW = W - 40 - PX;
  o.push(d.text("PIT WALL", { face: "monoBold", size: 12, x: PX, y: 50, fill: C.papaya, ls: 0.12 }).svg);
  o.push(d.text("Contributions, last 12 months", { face: "grotesk", size: 13, x: PX, y: 72, fill: C.dim }).svg);
  o.push(d.odometer(String(cal.total), { face: "anton", size: 58, x: W - 40, y: 82, anchor: "end", fill: C.paper, delay: 0.5, dur: 2.4, spins: 2 }).svg);

  const days = cal.days.map(([date, n]) => ({ date, n, wd: new Date(`${date}T00:00:00Z`).getUTCDay() }));
  const first = days[0].wd;
  const cols = Math.ceil((days.length + first) / 7);
  // Weekly totals for the trace.
  const weeks = Array.from({ length: cols }, () => 0);
  days.forEach((dd, i) => (weeks[Math.floor((i + first) / 7)] += dd.n));
  const maxW = Math.max(1, ...weeks);
  const TY = 112;
  const TH = 118;
  const step = PW / (cols - 1);
  const pts = weeks.map((v, i) => [PX + i * step, TY + TH - (v / maxW) * (TH - 8)]);
  // A smooth line through the weekly points.
  let path = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    path += `C${r2(mx)} ${r2(y0)} ${r2(mx)} ${r2(y1)} ${r2(x1)} ${r2(y1)}`;
  }
  const area = `${path}L${r2(pts.at(-1)[0])} ${TY + TH}L${PX} ${TY + TH}Z`;
  d.defs.push(`<linearGradient id="ar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.papaya}" stop-opacity=".28"/><stop offset="1" stop-color="${C.papaya}" stop-opacity="0"/></linearGradient>`);
  d.defs.push(`<clipPath id="arc"><rect x="${PX}" y="${TY - 10}" height="${TH + 20}" width="0"><animate attributeName="width" from="0" to="${PW + 4}" begin=".6s" dur="2.4s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".65 0 .35 1"/></rect></clipPath>`);
  d.defs.push(`<radialGradient id="cg"><stop offset="0" stop-color="${C.papaya}" stop-opacity=".8"/><stop offset="1" stop-color="${C.papaya}" stop-opacity="0"/></radialGradient>`);
  const grid2 = [0.25, 0.5, 0.75, 1].map((f) => `<line x1="${PX}" x2="${W - 40}" y1="${r2(TY + TH - f * (TH - 8))}" y2="${r2(TY + TH - f * (TH - 8))}" stroke="${C.hair}" stroke-dasharray="2 4"/>`).join("");
  o.push(`${grid2}<g clip-path="url(#arc)"><path d="${area}" fill="url(#ar)"/><path d="${path}" fill="none" stroke="${C.papaya}" stroke-width="2.2" stroke-linejoin="round"/></g>`);
  // A car lapping the trace.
  o.push(`<g opacity="0"><animate attributeName="opacity" to="1" begin="3s" dur=".4s" fill="freeze"/><circle r="14" fill="url(#cg)"/><circle r="4" fill="#fff"/><animateMotion dur="10s" begin="3s" repeatCount="indefinite" path="${path}"/></g>`);
  o.push(d.text(`peak week ${maxW}`, { face: "mono", size: 11, x: W - 40, y: TY - 4, anchor: "end", fill: C.dim }).svg);

  // Heatmap, swept in column by column.
  const HY = TY + TH + 22;
  const cell = PW / cols;
  const sz = r2(cell - 1.8);
  const maxD = Math.max(1, ...days.map((x) => x.n));
  const lvl = (n) => (n === 0 ? 0 : n <= maxD * 0.15 ? 1 : n <= maxD * 0.35 ? 2 : n <= maxD * 0.65 ? 3 : 4);
  const fills = ["#1b1b21", "rgba(255,128,0,.3)", "rgba(255,128,0,.5)", "rgba(255,128,0,.75)", C.papaya];
  d.css.push(`.hc{animation:hc .5s ease both}@keyframes hc{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`);
  const colsSvg = [];
  for (let c = 0; c < cols; c++) {
    const cells = [];
    for (let r = 0; r < 7; r++) {
      const i = c * 7 + r - first;
      if (i < 0 || i >= days.length) continue;
      cells.push(`<rect x="${r2(PX + c * cell)}" y="${r2(HY + r * cell)}" width="${sz}" height="${sz}" rx="1.6" fill="${fills[lvl(days[i].n)]}"/>`);
    }
    colsSvg.push(`<g class="hc" style="animation-delay:${r2(0.7 + c * 0.03)}s">${cells.join("")}</g>`);
  }
  o.push(colsSvg.join(""));
  // Month marks.
  let lastM = -1;
  for (let c = 0; c < cols; c++) {
    const i = Math.max(0, c * 7 - first);
    if (i >= days.length) break;
    const m = Number(days[i].date.slice(5, 7));
    if (m !== lastM && c < cols - 2) {
      if (lastM !== -1) o.push(d.text("JFMAMJJASOND"[m - 1], { face: "mono", size: 10, x: r2(PX + c * cell), y: HY + 7 * cell + 14, fill: C.dim }).svg);
      lastM = m;
    }
  }

  // Stats line.
  const active = days.filter((x) => x.n > 0).length;
  let streak = 0;
  let j = days.length - 1;
  if (days[j].n === 0) j--;
  while (j >= 0 && days[j].n > 0) {
    streak++;
    j--;
  }
  const stats = [
    ["ACTIVE DAYS", String(active)],
    ["BEST DAY", String(maxD)],
    ["CURRENT STREAK", `${streak} day${streak === 1 ? "" : "s"}`],
  ];
  let sx = PX;
  const SY = H - 30;
  stats.forEach(([k, v]) => {
    const a = d.text(k, { face: "monoBold", size: 10.5, x: sx, y: SY, fill: C.dim, ls: 0.1 });
    const b = d.text(v, { face: "groteskBold", size: 15, x: sx + a.w + 10, y: SY + 1, fill: C.paper });
    o.push(a.svg, b.svg);
    sx += a.w + b.w + 34;
  });
  o.push(d.text(`updated ${live.updated}`, { face: "mono", size: 10.5, x: W - 40, y: SY, anchor: "end", fill: C.dim }).svg);
  return d.render(o.join("\n"));
}
