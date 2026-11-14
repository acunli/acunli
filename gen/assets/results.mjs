// Results: the classification so far.
import { C, Doc, panel, r2, wrap } from "../lib.mjs";

const ROWS = [
  ["#8", "World rank, of 20,000 developers", "lablab.ai AMD Developer Hackathon ACT II, with ClipContext"],
  ["#3", "Community Choice", "AMD Developer Hackathon ACT II, with ClipContext"],
  ["#1", "Appathon 2025", "Rank 1"],
  ["#1", "All India Rank", "ACER Reasoning Olympiad"],
  ["WIN", "tGELF Youth Leader 2024–25", "Chakr: 260+ refurbished bicycles to students, SGD 3,300+ crowdfunded"],
  ["5,000+", "Students represented", "Head Boy, Delhi Public School Gurgaon"],
];

export function results() {
  const W = 1000;
  const H = 336;
  const d = new Doc(W, H, { title: "Results", desc: ROWS.map((r) => r.join(", ")).join(". ") });
  const o = [panel(d)];
  o.push(d.text("RESULTS", { face: "monoBold", size: 12, x: 40, y: 50, fill: C.papaya, ls: 0.12 }).svg);
  o.push(d.text("Hackathons, olympiads and the people I've led", { face: "grotesk", size: 13, x: 122, y: 50, fill: C.dim }).svg);
  const CW = (W - 80 - 24) / 2;
  const RH = 82;
  const Y0 = 70;
  d.css.push(
    `.rw{animation:rw .9s cubic-bezier(.16,1,.3,1) both}@keyframes rw{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:none}}`,
    `.sw{opacity:0;animation:sw 1s cubic-bezier(.5,0,.5,1) both}@keyframes sw{0%{opacity:0;transform:translateX(0) skewX(-20deg)}10%{opacity:.5}100%{opacity:0;transform:translateX(${r2(CW + 80)}px) skewX(-20deg)}}`,
    `.gold{animation:gold 5s ease-in-out 2.5s infinite}@keyframes gold{0%,80%,100%{opacity:0}88%{opacity:.9}}`,
  );
  ROWS.forEach(([pos, title, sub], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * (CW + 24);
    const y = Y0 + row * RH;
    const delay = r2(0.3 + i * 0.13);
    const cid = `rc${i}`;
    d.defs.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${CW}" height="${RH - 10}" rx="10"/></clipPath>`);
    const first = pos === "#1" || pos === "WIN";
    const colr = first ? C.gold : C.papaya;
    const num = /\d/.test(pos)
      ? d.odometer(pos, { face: "anton", size: 40, x: x + 18, y: y + 52, fill: colr, delay: delay + 0.2, dur: 1.8, spins: 1 }).svg
      : d.text(pos, { face: "anton", size: 40, x: x + 18, y: y + 52, fill: colr }).svg;
    const tx = x + 138;
    const lines = wrap(sub, "grotesk", 13, CW - 150);
    const parts = [
      `<rect x="${x}" y="${y}" width="${CW}" height="${RH - 10}" rx="10" fill="#fff" fill-opacity=".035" stroke="${C.hair}"/>`,
      `<rect x="${x}" y="${y + 14}" width="3" height="${RH - 38}" rx="1.5" fill="${colr}"/>`,
      num,
      d.text(title, { face: "groteskBold", size: 16.5, x: tx, y: y + (lines.length > 1 ? 26 : 32), fill: C.paper }).svg,
      ...lines.slice(0, 2).map((l, j) => d.text(l, { face: "grotesk", size: 13, x: tx, y: y + (lines.length > 1 ? 46 : 52) + j * 17, fill: C.dim }).svg),
      `<g clip-path="url(#${cid})"><rect class="sw" style="animation-delay:${r2(delay + 0.25)}s" x="${x - 60}" y="${y}" width="40" height="${RH}" fill="#fff"/>${first ? `<rect class="gold" style="animation-delay:${r2(2.5 + i * 0.4)}s" x="${x}" y="${y}" width="${CW}" height="${RH}" fill="none" stroke="${C.gold}" stroke-opacity=".5" rx="10"/>` : ""}</g>`,
    ];
    o.push(`<g class="rw" style="animation-delay:${delay}s">${parts.join("")}</g>`);
  });
  return d.render(o.join("\n"));
}
