// The header: five red lights, lights out, the name arrives at speed, then a car
// keeps lapping a circuit behind it while the shift lights rev.
import { C, Doc, panel, font, r2 } from "../lib.mjs";

// A made-up street circuit, clockwise. pathLength=1000 keeps the trail and car in step.
const TRACK =
  "M540 400L820 400C880 400 915 380 915 330L915 250C915 215 890 200 860 210L790 240C760 252 735 240 738 210L745 150C750 105 800 90 840 100L900 112C950 122 955 60 905 62L600 70C520 72 480 110 500 170C515 215 560 230 560 280C560 320 500 330 495 365C492 392 510 400 540 400Z";

export function hero() {
  const W = 1000;
  const H = 548;
  const d = new Doc(W, H, {
    title: "Ayushman Chaudhuri",
    desc: "Five red start lights go out and the name Ayushman Chaudhuri arrives. Business AI Systems at NUS Computing, Singapore: building models that stop being demos and start being systems. Open to AI/ML internships.",
  });
  const o = [panel(d)];
  const LO = 3.8; // lights out

  // ---- circuit + car ----
  d.defs.push(`<radialGradient id="cglow"><stop offset="0" stop-color="${C.papaya}" stop-opacity=".85"/><stop offset="1" stop-color="${C.papaya}" stop-opacity="0"/></radialGradient>`, `<radialGradient id="lglow"><stop offset=".45" stop-color="${C.flame}" stop-opacity=".9"/><stop offset="1" stop-color="${C.flame}" stop-opacity="0"/></radialGradient>`);
  d.css.push(
    `.trk{animation:fade 1.2s ease ${LO + 0.4}s both}`,
    `@keyframes fade{from{opacity:0}to{opacity:1}}`,
  );
  o.push(`<g class="trk"><g transform="translate(6 -22)">
<path d="${TRACK}" fill="none" stroke="${C.paper}" stroke-opacity=".05" stroke-width="16" stroke-linejoin="round"/>
<path d="${TRACK}" fill="none" stroke="${C.paper}" stroke-opacity=".10" stroke-width="1" stroke-dasharray="6 10"/>
<path d="M858 388L858 412M866 388L866 412" stroke="${C.paper}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="3 3"/>
${[
  [70, 0.18, 10],
  [34, 0.45, 6],
  [12, 1, 4],
]
  .map(([a, op, sw], i) => {
    d.css.push(`.tr${i}{stroke-dasharray:${a} 1000;animation:tr${i} 9s linear infinite}@keyframes tr${i}{from{stroke-dashoffset:${a}}to{stroke-dashoffset:${a - 1000}}}`);
    return `<path class="tr${i}" d="${TRACK}" pathLength="1000" fill="none" stroke="${C.papaya}" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round"/>`;
  })
  .join("")}
<g><circle r="16" fill="url(#cglow)"/><circle r="4.5" fill="#fff"/>
<animateMotion dur="9s" repeatCount="indefinite" path="${TRACK}"/></g>
</g></g>`);

  // ---- top strip: live dot + shift lights ----
  d.css.push(
    `.live{animation:live 1.4s ease-in-out infinite}@keyframes live{50%{opacity:.25}}`,
    `.leds{animation:fade .4s ease ${LO + 0.2}s both}`,
  );
  o.push(`<circle class="live" cx="46" cy="44" r="5" fill="${C.flame}"/>`);
  o.push(d.text("LIVE FROM SINGAPORE", { face: "monoBold", size: 12, x: 60, y: 48.5, fill: C.paper, ls: 0.08 }).svg);
  const ledCols = [C.green, C.green, C.green, C.green, C.green, C.flame, C.flame, C.flame, C.flame, C.flame, C.purple, C.purple, C.purple, C.purple, C.purple];
  const ledX0 = W - 46 - 15 * 22 + 8;
  const leds = ledCols.map((col, i) => {
    const k = `led${i}`;
    const on = 4 + i * 4.2; // % of the rev cycle
    d.css.push(
      `.${k}{animation:${k} 2.2s linear ${LO + 0.4}s infinite}`,
      `@keyframes ${k}{0%,${r2(on - 0.01)}%{fill:#1d1d24}${r2(on)}%,74%{fill:${col}}76%,82%{fill:${C.purple}}84%,88%{fill:#1d1d24}90%,95%{fill:${C.purple}}97%,100%{fill:#1d1d24}}`,
    );
    return `<rect class="${k}" x="${ledX0 + i * 22}" y="37" width="14" height="14" rx="4" fill="#1d1d24"/>`;
  });
  o.push(`<g class="leds">${leds.join("")}</g>`);

  // ---- the name ----
  const A = font("anton");
  const size = 132;
  const cap = (A.cap / A.upem) * size;
  const y1 = 92 + cap;
  const y2 = y1 + cap + 18;
  d.css.push(
    `.nl{transform-box:fill-box;transform-origin:0 100%;animation:nl .8s cubic-bezier(.16,1,.3,1) both}`,
    `@keyframes nl{from{opacity:0;transform:translateX(-120px) skewX(-22deg)}35%{opacity:1}to{opacity:1;transform:none}}`,
  );
  const letters = (str, y, fill, t0) =>
    d.text(str, { face: "anton", size, x: 52, y, fill, perChar: (i) => `class="nl" style="animation-delay:${r2(t0 + i * 0.045)}s"` }).svg;
  o.push(letters("AYUSHMAN", y1, C.paper, LO + 0.08));
  o.push(letters("CHAUDHURI", y2, C.papaya, LO + 0.22));

  // Speed streaks at lights out.
  d.css.push(`.sk{opacity:0;animation:sk .55s cubic-bezier(.5,0,.75,0) both}@keyframes sk{0%{opacity:0;transform:translateX(-420px)}2%{opacity:.9}100%{opacity:0;transform:translateX(1100px)}}`);
  const streaks = [118, 150, 196, 232, 262, 300, 330]
    .map((y, i) => `<rect class="sk" style="animation-delay:${r2(LO + 0.02 + i * 0.035)}s" x="0" y="${y}" width="${260 + (i % 3) * 90}" height="${i % 2 ? 1.5 : 3}" rx="1.5" fill="${i % 3 ? C.paper : C.papaya}"/>`)
    .join("");
  o.push(streaks);

  // ---- subtitle, typed ----
  const ty0 = LO + 1.2;
  d.css.push(`.ty{animation:ty .14s linear both}@keyframes ty{from{opacity:0}to{opacity:1}}`);
  const lines = ["Business AI Systems @ NUS Computing, Singapore.", "Building models that stop being demos and start being systems."];
  let t = ty0;
  const sy = y2 + 50;
  lines.forEach((ln, li) => {
    const r = d.text(`${li ? ">" : ">"} ${ln}`, {
      face: "mono",
      size: 18,
      x: 54,
      y: sy + li * 30,
      fill: li ? C.dim : C.paper,
      perChar: (i) => `class="ty" style="animation-delay:${r2(t + i * 0.022)}s"`,
    });
    t += (ln.length + 2) * 0.022 + 0.25;
    o.push(r.svg);
    if (li === lines.length - 1) {
      d.css.push(`.cw{animation:fade .1s ${r2(t)}s both}.cb{animation:live 1s steps(1) infinite}`);
      o.push(`<g class="cw"><rect class="cb" x="${r2(r.x0 + r.w + 6)}" y="${sy + li * 30 - 15}" width="10" height="19" fill="${C.papaya}"/></g>`);
    }
  });
  // The "> " prompt marks in papaya, over the typed ones.
  // (Kept simple: the prompts are part of the typed lines.)

  // ---- bottom HUD ----
  const hy = H - 70;
  o.push(`<line x1="40" x2="${W - 40}" y1="${hy - 14}" y2="${hy - 14}" stroke="${C.faint}"/>`);
  d.css.push(`.hf{animation:hf .7s cubic-bezier(.16,1,.3,1) both}@keyframes hf{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`);
  const fields = [
    ["FOCUS", "AI / ML engineering"],
    ["ROLE", "Tech Exec, NUS Entrepreneurship Society"],
    ["STATUS", "Open to internships"],
  ];
  let fx = 46;
  fields.forEach(([k, v], i) => {
    const delay = r2(LO + 0.9 + i * 0.09);
    const lab = d.text(k, { face: "mono", size: 11, x: fx, y: hy + 6, fill: C.dim, ls: 0.1 });
    const val = d.text(v, { face: "groteskBold", size: 18, x: fx, y: hy + 34, fill: k === "STATUS" ? C.papaya : C.paper });
    o.push(`<g class="hf" style="animation-delay:${delay}s">${lab.svg}${val.svg}${k === "STATUS" ? `<circle class="live" cx="${r2(fx + lab.w + 10)}" cy="${hy + 2}" r="3.5" fill="${C.papaya}"/>` : ""}</g>`);
    fx += Math.max(lab.w, val.w) + 36;
    if (i < fields.length - 1) o.push(`<line class="hf" style="animation-delay:${delay}s" x1="${fx - 18}" x2="${fx - 18}" y1="${hy - 4}" y2="${hy + 38}" stroke="${C.faint}"/>`);
  });
  // Speed readout on the right.
  const sp = d.odometer("318", { face: "anton", size: 44, x: W - 104, y: hy + 36, anchor: "end", fill: C.paper, delay: LO + 1.1, dur: 2.2, spins: 2 });
  o.push(`<g class="hf" style="animation-delay:${r2(LO + 1)}s">${sp.svg}${d.text("KM/H", { face: "monoBold", size: 12, x: W - 96, y: hy + 14, fill: C.dim, ls: 0.1 }).svg}${d.text("GEAR 8", { face: "monoBold", size: 12, x: W - 96, y: hy + 34, fill: C.papaya, ls: 0.1 }).svg}</g>`);

  // ---- start lights (drawn last, over everything, then they leave) ----
  const pods = 5;
  const pw = 64;
  const gap = 18;
  const gx0 = W / 2 - (pods * pw + (pods - 1) * gap) / 2;
  const gy = 120;
  d.css.push(
    `.gantry{opacity:0;animation:gantry ${LO + 0.6}s ease both}`,
    `@keyframes gantry{0%{opacity:0;transform:translateY(-30px)}6%,${r2((LO / (LO + 0.6)) * 100)}%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-40px)}}`,
  );
  const podSvg = [];
  for (let i = 0; i < pods; i++) {
    const on = 0.6 + i * 0.6;
    const k = `lt${i}`;
    d.css.push(
      `.${k}{animation:${k} ${LO}s linear both}@keyframes ${k}{0%,${r2((on / LO) * 100 - 0.01)}%{fill:#1b1b21}${r2((on / LO) * 100)}%,99.9%{fill:${C.flame}}100%{fill:#1b1b21}}`,
      `.${k}g{opacity:0;animation:${k}g ${LO}s linear both}@keyframes ${k}g{0%,${r2((on / LO) * 100 - 0.01)}%{opacity:0}${r2((on / LO) * 100)}%,99.9%{opacity:.85}100%{opacity:0}}`,
    );
    const x = gx0 + i * (pw + gap);
    podSvg.push(`<rect x="${x}" y="${gy}" width="${pw}" height="150" rx="14" fill="#060608" stroke="${C.faint}"/>
<circle cx="${x + pw / 2}" cy="${gy + 38}" r="19" fill="#1b1b21"/><circle cx="${x + pw / 2}" cy="${gy + 82}" r="19" fill="#1b1b21"/>
<circle class="${k}g" cx="${x + pw / 2}" cy="${gy + 82}" r="32" fill="url(#lglow)"/><circle class="${k}g" cx="${x + pw / 2}" cy="${gy + 122}" r="32" fill="url(#lglow)"/>
<circle class="${k}" cx="${x + pw / 2}" cy="${gy + 82}" r="19" fill="#1b1b21"/><circle class="${k}" cx="${x + pw / 2}" cy="${gy + 122}" r="19" fill="#1b1b21"/>`);
  }
  o.push(`<g class="gantry"><rect x="${gx0 - 30}" y="${gy + 10}" width="${pods * pw + (pods - 1) * gap + 60}" height="16" rx="4" fill="#050506" stroke="${C.faint}"/>${podSvg.join("")}</g>`);

  return d.render(o.join("\n"));
}
