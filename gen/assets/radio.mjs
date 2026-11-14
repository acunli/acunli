// Team radio: what's happening now, as messages to the pit wall.
import { C, Doc, panel, r2, wrap } from "../lib.mjs";

export function radio(live) {
  const W = 1000;
  const H = 196;
  const msgs = [
    ["NOW BUILDING", "The finance system for the NUS Entrepreneurship Society: tiered approvals and an audit trail nobody can edit."],
    ["ON TRACK", `whatsthisposition.com has reviewed ${live.gamesReviewed.toLocaleString("en-US")} games. Stockfish runs in each visitor's browser, not on a server.`],
    ["LOOKING FOR", "AI/ML internships, research ideas and hackathon teams. Problems that need a model, not a demo."],
  ];
  const d = new Doc(W, H, { title: "Team radio", desc: msgs.map(([a, b]) => `${a}: ${b}`).join(" ") });
  const o = [panel(d)];
  const each = 7;
  const T = each * msgs.length;

  // Who's talking.
  o.push(`<rect x="40" y="40" width="6" height="${H - 80}" rx="3" fill="${C.papaya}"/>`);
  o.push(d.text("AYUSHMAN", { face: "anton", size: 40, x: 64, y: 84, fill: C.paper }).svg);
  o.push(d.text("TEAM RADIO", { face: "monoBold", size: 12, x: 66, y: 108, fill: C.papaya, ls: 0.12 }).svg);

  // Voice waveform: each bar breathes on its own rhythm.
  const bars = [];
  for (let i = 0; i < 30; i++) {
    const k = `wv${i}`;
    const a = 0.25 + ((i * 37) % 11) / 14;
    const b = 0.15 + ((i * 53) % 7) / 10;
    const dur = r2(0.5 + ((i * 29) % 9) / 14);
    d.css.push(`.${k}{transform-box:fill-box;transform-origin:center;animation:${k} ${dur}s ease-in-out ${r2(-i * 0.07)}s infinite alternate}@keyframes ${k}{from{transform:scaleY(${r2(b)})}to{transform:scaleY(${r2(Math.min(1, a))})}}`);
    bars.push(`<rect class="${k}" x="${66 + i * 6}" y="126" width="3" height="34" rx="1.5" fill="${i % 6 === 0 ? C.papaya : C.paper}" opacity="${i % 6 === 0 ? 1 : 0.7}"/>`);
  }
  o.push(bars.join(""));
  o.push(`<line x1="270" x2="270" y1="40" y2="${H - 40}" stroke="${C.faint}"/>`);

  // Messages: a tag, then the words wiped in like a transcript, then the next.
  const MX = 300;
  const MW = W - 40 - MX;
  msgs.forEach(([tag, text], i) => {
    const t0 = i * each;
    const kt = (a) => r2(Math.max(0, Math.min(1, a / T)));
    const lines = wrap(text, "groteskBold", 23, MW);
    const show = `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${kt(t0)};${kt(t0 + 0.25)};${kt(t0 + each - 0.4)};${kt(t0 + each - 0.1)};1" dur="${T}s" repeatCount="indefinite"/>`;
    const parts = [d.text(tag, { face: "monoBold", size: 12, x: MX, y: 62, fill: C.papaya, ls: 0.12 }).svg];
    const per = 0.024; // seconds per character
    let tt = t0 + 0.35;
    lines.forEach((ln, j) => {
      const y = 104 + j * 34;
      const tx = d.text(ln, { face: "groteskBold", size: 23, x: MX, y, fill: C.paper });
      const cid = `rc${i}${j}`;
      const dur = ln.length * per;
      const w = r2(tx.w + 4);
      d.defs.push(
        `<clipPath id="${cid}"><rect x="${MX - 2}" y="${y - 28}" height="38" width="0"><animate attributeName="width" values="0;0;${w};${w};0" keyTimes="0;${kt(tt)};${kt(tt + dur)};${kt(t0 + each - 0.05)};1" dur="${T}s" repeatCount="indefinite"/></rect></clipPath>`,
      );
      parts.push(`<g clip-path="url(#${cid})">${tx.svg}</g>`);
      // The cursor rides the edge of the wipe on the line being written, then rests on the last.
      const last = j === lines.length - 1;
      const off = last ? t0 + each - 0.05 : tt + dur + 0.08;
      parts.push(
        `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${kt(tt)};${kt(tt)};${kt(off)};${kt(off)};1" dur="${T}s" repeatCount="indefinite"/><rect y="${y - 19}" width="10" height="22" fill="${C.papaya}"><animate attributeName="x" values="${MX};${MX};${r2(MX + w + 2)};${r2(MX + w + 2)}" keyTimes="0;${kt(tt)};${kt(tt + dur)};1" dur="${T}s" repeatCount="indefinite"/>${last ? `<animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/>` : ""}</rect></g>`,
      );
      tt += dur + 0.08;
    });
    o.push(`<g opacity="0">${show}${parts.join("")}</g>`);
  });
  // Progress ticks: which message is on air.
  msgs.forEach((_, i) => {
    const kt = (a) => r2(a / T);
    const t0 = i * each;
    o.push(
      `<rect x="${W - 40 - (msgs.length - i) * 30 + 6}" y="52" width="24" height="4" rx="2" fill="${C.faint}"/><rect x="${W - 40 - (msgs.length - i) * 30 + 6}" y="52" width="0" height="4" rx="2" fill="${C.papaya}"><animate attributeName="width" values="0;0;24;24;0" keyTimes="0;${kt(t0)};${kt(t0 + each)};${kt(t0 + each) === 1 ? 1 : kt(t0 + each + 0.01)};1" dur="${T}s" repeatCount="indefinite"/></rect>`,
    );
  });
  return d.render(o.join("\n"));
}
