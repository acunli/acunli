// The other builds, each with its own small machine running.
import { C, Doc, panel, r2, wrap, window_ } from "../lib.mjs";

function body(d, str, x, y, w, size = 15, fill = C.dim, lh = 1.45) {
  return wrap(str, "grotesk", size, w)
    .map((l, i) => d.text(l, { face: "grotesk", size, x, y: y + i * size * lh, fill }).svg)
    .join("");
}

function chips(d, items, x, y, maxW) {
  let cx = x;
  let cy = y;
  return items
    .map((s) => {
      const t = d.text(s, { face: "mono", size: 12, x: cx + 10, y: cy + 16, fill: C.paper });
      if (cx + t.w + 20 > x + maxW) {
        cx = x;
        cy += 30;
        return chips(d, [s], cx, cy, maxW);
      }
      const svg = `<rect x="${cx}" y="${cy}" width="${r2(t.w + 20)}" height="23" rx="5" fill="#fff" fill-opacity=".04" stroke="${C.faint}"/>${d.text(s, { face: "mono", size: 12, x: cx + 10, y: cy + 16, fill: C.paper }).svg}`;
      cx += t.w + 28;
      return svg;
    })
    .join("");
}

// ---------------------------------------------------------------- ClipContext
export function clipcontext() {
  const W = 1000;
  const H = 330;
  const d = new Doc(W, H, {
    title: "ClipContext",
    desc: "ClipContext: multimodal video understanding. Frames are scanned, a video context is built, ten candidate titles are generated and an AI judge ranks the top five. World #8 of 20,000 developers at the lablab.ai AMD ACT II Hackathon.",
  });
  const o = [panel(d)];
  o.push(d.text("TEAM LEAD & LEAD DEVELOPER, 2026", { face: "monoBold", size: 11, x: 40, y: 52, fill: C.dim, ls: 0.1 }).svg);
  o.push(d.text("ClipContext", { face: "anton", size: 56, x: 38, y: 116, fill: C.paper }).svg);
  o.push(body(d, "Upload a short video, get titles, descriptions and hashtags written from what it actually says and shows, then ranked by a second AI.", 40, 148, 360));
  // Result plate.
  o.push(`<rect x="40" y="214" width="360" height="44" rx="8" fill="${C.papaya}" fill-opacity=".1" stroke="${C.papaya}" stroke-opacity=".5"/>`);
  o.push(d.odometer("8", { face: "anton", size: 30, x: 72, y: 248, anchor: "middle", fill: C.papaya, delay: 0.6, dur: 1.6, spins: 2 }).svg);
  o.push(d.text("#", { face: "anton", size: 18, x: 52, y: 238, fill: C.papaya }).svg);
  o.push(d.text("World rank of 20,000 developers", { face: "groteskBold", size: 15, x: 94, y: 234, fill: C.paper }).svg);
  o.push(d.text("lablab.ai AMD Developer Hackathon, ACT II", { face: "grotesk", size: 12.5, x: 94, y: 251, fill: C.dim }).svg);
  o.push(chips(d, ["PyTorch", "vLLM", "ROCm", "FastAPI", "Next.js"], 40, 274, 380));

  // Film strip, scrolling under a scanner.
  const SX = 440;
  const SW = W - 40 - SX;
  d.defs.push(`<clipPath id="strip"><rect x="${SX}" y="36" width="${SW}" height="104" rx="10"/></clipPath>`);
  const frame = (i, x) => {
    const hue = [28, 200, 160, 340, 48, 260, 12, 190][i % 8];
    const sel = [1, 4, 6].includes(i % 8);
    return `<g transform="translate(${x} 52)"><rect width="92" height="72" rx="4" fill="hsl(${hue} 30% 16%)"/>
<circle cx="${30 + (i * 13) % 34}" cy="${30 + (i * 7) % 20}" r="${12 + (i % 3) * 5}" fill="hsl(${hue} 70% 55%)" opacity=".55"/>
<rect x="${8 + (i * 11) % 40}" y="${44 + (i % 2) * 6}" width="${36 + (i * 5) % 30}" height="10" rx="3" fill="hsl(${hue} 40% 70%)" opacity=".35"/>
${sel ? `<rect x="-2" y="-2" width="96" height="76" rx="5" fill="none" stroke="${C.papaya}" stroke-width="2.5"/><rect x="62" y="4" width="26" height="14" rx="3" fill="${C.papaya}"/>${d.text("KEY", { face: "monoBold", size: 9, x: 75, y: 14.5, anchor: "middle", fill: C.ink }).svg}` : ""}</g>`;
  };
  const frames = [];
  for (let i = 0; i < 16; i++) frames.push(frame(i, SX + 8 + i * 104));
  d.css.push(`.film{animation:film 12s linear infinite}@keyframes film{from{transform:translateX(0)}to{transform:translateX(-832px)}}`);
  const holes = [];
  for (let i = 0; i < 34; i++) holes.push(`<rect x="${SX + i * 26}" y="40" width="12" height="7" rx="2" fill="#000" opacity=".5"/><rect x="${SX + i * 26}" y="129" width="12" height="7" rx="2" fill="#000" opacity=".5"/>`);
  d.css.push(`.scan{animation:scan 2.4s cubic-bezier(.45,0,.55,1) infinite alternate}@keyframes scan{from{transform:translateX(0)}to{transform:translateX(${SW - 40}px)}}`);
  o.push(`<g clip-path="url(#strip)"><rect x="${SX}" y="36" width="${SW}" height="104" fill="#16161c"/><g class="film">${holes.join("")}${frames.join("")}</g>
<g class="scan"><rect x="${SX + 18}" y="36" width="2" height="104" fill="${C.papaya}"/><rect x="${SX + 4}" y="36" width="30" height="104" fill="${C.papaya}" opacity=".12"/></g></g>`);
  o.push(d.text("1 FPS SCAN, DIVERSE KEYFRAMES", { face: "monoBold", size: 10.5, x: SX, y: 160, fill: C.dim, ls: 0.1 }).svg);

  // Ten candidates generated, then the judge sorts them; the top five stay lit.
  const scores = [7.4, 9.1, 6.2, 8.5, 5.8, 9.4, 7.9, 6.6, 8.7, 8.2];
  const order = scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
  const T = 8;
  const RY = 178;
  const RH = 12.2;
  const BW = 250;
  const rows = [];
  scores.forEach((s, i) => {
    const rank = order.indexOf(i);
    const k = `cand${i}`;
    const dy = (rank - i) * RH;
    const top = rank < 5;
    d.css.push(
      `.${k}{transform:translateY(${dy}px);animation:${k} ${T}s cubic-bezier(.65,0,.35,1) infinite}@keyframes ${k}{0%{transform:translateY(0);opacity:0}${r2((0.2 + i * 0.12) / T * 100)}%{transform:translateY(0);opacity:0}${r2((0.45 + i * 0.12) / T * 100)}%{opacity:1;transform:translateY(0)}35%{transform:translateY(0)}50%,92%{transform:translateY(${dy}px);opacity:${top ? 1 : 0.32}}100%{transform:translateY(${dy}px);opacity:0}}`,
    );
    const w = r2(70 + (s - 5) * 38);
    d.css.push(`.${k}b{fill:${top ? C.papaya : C.paper};animation:${k}b ${T}s steps(1,end) infinite}@keyframes ${k}b{0%{fill:${C.paper}}50%,92%{fill:${top ? C.papaya : C.paper}}100%{fill:${C.paper}}}`);
    rows.push(
      `<g class="${k}"><rect class="${k}b" x="${SX + 150}" y="${RY + i * RH}" width="${w}" height="8" rx="2" opacity=".9"/>${d.text(s.toFixed(1), { face: "mono", size: 10, x: SX + 150 + w + 8, y: RY + i * RH + 8, fill: C.dim }).svg}</g>`,
    );
  });
  // The context node feeding them.
  d.css.push(`.ctx{animation:ctx 2s ease-in-out infinite}@keyframes ctx{50%{opacity:.55}}`);
  o.push(`<rect x="${SX}" y="${RY + 18}" width="122" height="64" rx="8" fill="#fff" fill-opacity=".04" stroke="${C.faint}"/>
${d.text("VideoContext", { face: "groteskBold", size: 14, x: SX + 12, y: RY + 42, fill: C.paper }).svg}
<g class="ctx">${d.text("speech + visuals", { face: "mono", size: 10.5, x: SX + 12, y: RY + 62, fill: C.dim }).svg}</g>
<path d="M${SX + 61} 146V${RY + 16}" stroke="${C.faint}" stroke-dasharray="3 3"/><path d="M${SX + 124} ${RY + 50}H${SX + 144}" stroke="${C.faint}"/><path d="M${SX + 140} ${RY + 46}l4 4-4 4" stroke="${C.faint}" fill="none"/>`);
  o.push(rows.join(""));
  d.css.push(window_("judge", T * 0.5, T * 0.92, T, 0.2));
  o.push(`<g class="judge">${d.text("TOP 5 BY THE AI JUDGE", { face: "monoBold", size: 10.5, x: W - 40, y: 160, fill: C.papaya, ls: 0.1, anchor: "end" }).svg}</g>`);
  o.push(d.text("10 CANDIDATES", { face: "monoBold", size: 10.5, x: SX, y: RY + 106, fill: C.dim, ls: 0.1 }).svg, d.text("PER POOL", { face: "monoBold", size: 10.5, x: SX, y: RY + 121, fill: C.dim, ls: 0.1 }).svg);
  return d.render(o.join("\n"));
}

// ---------------------------------------------------------------- WattLah!
export function wattlah() {
  const W = 490;
  const H = 360;
  const d = new Doc(W, H, {
    title: "WattLah!",
    desc: "WattLah!: a pixel apartment where a resident walks between appliances, scans their meters and builds a savings plan. LifeHack 2026.",
  });
  const o = [panel(d, { glow: C.green })];
  o.push(d.text("LIFEHACK 2026, TEAM BUILD", { face: "monoBold", size: 11, x: 28, y: 44, fill: C.dim, ls: 0.1 }).svg);
  o.push(d.text("WattLah!", { face: "anton", size: 44, x: 26, y: 94, fill: C.paper }).svg);
  o.push(body(d, "Your flat as a pixel game: walk around, scan meters, find the biggest drains and build a savings plan.", 28, 120, W - 56, 14));

  // The room, on a 12px pixel grid.
  const P = 12;
  const RX = 28;
  const RY = 168;
  const cols = 36;
  const rowsN = 13;
  const floor = [];
  for (let r = 0; r < rowsN; r++)
    for (let c = 0; c < cols; c++) if ((r + c) % 2 === 0) floor.push(`<rect x="${RX + c * P}" y="${RY + r * P}" width="${P}" height="${P}" fill="#fff" opacity=".025"/>`);
  o.push(`<rect x="${RX}" y="${RY}" width="${cols * P}" height="${rowsN * P}" rx="6" fill="#141a17" stroke="${C.faint}"/>${floor.join("")}`);
  o.push(`<rect x="${RX}" y="${RY}" width="${cols * P}" height="${P * 2}" fill="#1f2a25"/>`);
  // Appliances: [name, kW, col, row, w, h, colour]
  const apps = [
    ["Aircon", "1.4 kW", 3, 0, 5, 2, "#d9e4ea"],
    ["Fridge", "0.2 kW", 30, 1, 4, 6, "#c7d0cc"],
    ["TV", "0.1 kW", 14, 1, 6, 2, "#2b3440"],
    ["Washer", "0.5 kW", 28, 9, 4, 4, "#e6e6e6"],
  ];
  const T = 10;
  const stops = [
    [6, 6],
    [6, 3],
    [16, 4],
    [27, 5],
    [26, 9],
    [10, 9],
    [6, 6],
  ];
  // Visit order: aircon, TV, fridge, washer.
  const visitAt = { Aircon: 1.6, TV: 3.4, Fridge: 5.2, Washer: 6.9 };
  apps.forEach(([name, kw, c, r, w, h, col]) => {
    const k = `ap${name}`;
    const t0 = visitAt[name];
    d.css.push(window_(`${k}g`, t0, t0 + 1.5, T, 0.2), window_(`${k}t`, t0 + 0.1, t0 + 1.5, T, 0.15));
    const x = RX + c * P;
    const y = RY + r * P;
    o.push(`<g class="${k}g"><rect x="${x - 3}" y="${y - 3}" width="${w * P + 6}" height="${h * P + 6}" rx="4" fill="none" stroke="${C.green}" stroke-width="6" stroke-opacity=".25"/><rect x="${x - 1}" y="${y - 1}" width="${w * P + 2}" height="${h * P + 2}" rx="3" fill="none" stroke="${C.green}" stroke-width="2"/></g>
<rect x="${x}" y="${y}" width="${w * P}" height="${h * P}" rx="2" fill="${col}"/><rect x="${x + 3}" y="${y + 3}" width="${P / 2}" height="${P / 2}" fill="${C.green}" opacity=".8"/>`);
    const tagX = Math.min(RX + cols * P - 96, Math.max(RX + 4, x + (w * P) / 2 - 46));
    const tagY = r > 6 ? y - 34 : y + h * P + 8;
    o.push(`<g class="${k}t"><rect x="${tagX}" y="${tagY}" width="92" height="26" rx="4" fill="${C.ink}" stroke="${C.green}"/>${d.text(`${name} ${kw}`, { face: "monoBold", size: 10, x: tagX + 46, y: tagY + 17, anchor: "middle", fill: C.green }).svg}</g>`);
  });
  // Furniture and appliance details.
  const px2 = (c, r, w, h, fill, extra = "") => `<rect x="${RX + c * P}" y="${RY + r * P}" width="${w * P}" height="${h * P}" fill="${fill}" ${extra}/>`;
  d.css.push(
    `.drum{transform-box:fill-box;transform-origin:center;animation:drum 1.2s linear infinite}@keyframes drum{to{transform:rotate(360deg)}}`,
    `.tvs{animation:tvs 2.6s steps(4) infinite}@keyframes tvs{0%{fill:#3d6fd1}25%{fill:#d1503d}50%{fill:#3dd18a}75%{fill:#d1b33d}}`,
  );
  o.push(
    // rug, sofa, plant, lamp
    `<rect x="${RX + 11 * P}" y="${RY + 5 * P}" width="${10 * P}" height="${3 * P}" rx="3" fill="${C.papaya}" opacity=".08"/>`,
    px2(12, 9, 8, 1, "#6b4a3a"), px2(12, 10, 8, 2, "#8a5d48"), px2(11, 9, 1, 3, "#6b4a3a"), px2(20, 9, 1, 3, "#6b4a3a"),
    px2(1, 10, 2, 2, "#4b3426"), `<rect x="${RX + P * 0.5}" y="${RY + 8 * P}" width="${P * 3}" height="${P * 2}" rx="${P}" fill="#3a8f5a"/>`,
    // aircon vents
    ...[0, 1, 2].map((i) => `<rect x="${RX + 3 * P + 6}" y="${RY + 8 + i * 5}" width="${5 * P - 12}" height="1.6" fill="#9fb0b8"/>`),
    // tv screen + stand
    `<rect class="tvs" x="${RX + 14 * P + 4}" y="${RY + P + 4}" width="${6 * P - 8}" height="${2 * P - 8}" fill="#3d6fd1" opacity=".55"/>`, px2(16.5, 3, 1, 0.5, "#2b3440"),
    // fridge door line + handle
    `<rect x="${RX + 30 * P}" y="${RY + 3 * P}" width="${4 * P}" height="1.5" fill="#8d9894"/><rect x="${RX + 33 * P + 2}" y="${RY + 3.4 * P}" width="2.5" height="${P * 1.5}" fill="#8d9894"/>`,
    // washer door + drum
    `<circle cx="${RX + 30 * P}" cy="${RY + 11.2 * P}" r="${P * 1.3}" fill="#9aa4ab"/><g class="drum"><circle cx="${RX + 30 * P}" cy="${RY + 11.2 * P}" r="${P * 0.95}" fill="#5f7d95"/><rect x="${RX + 30 * P - 2}" y="${RY + 11.2 * P - P * 0.9}" width="4" height="${P * 0.7}" fill="#cfd8de"/></g>`,
  );
  // The resident: a pixel sprite that hops square to square.
  const seg = T / (stops.length - 1);
  const kf = stops.map(([c, r], i) => `${r2(((i * seg) / T) * 100)}%{transform:translate(${RX + c * P}px,${RY + r * P}px)}`).join("");
  d.css.push(`.res{animation:res ${T}s steps(6,end) infinite}@keyframes res{${kf}}`, `.bob{animation:bob .3s steps(2) infinite}@keyframes bob{50%{transform:translateY(-2px)}}`);
  const sprite = [
    "..oooo..",
    "..oooo..",
    "...oo...",
    ".gggggg.",
    "o.gggg.o",
    "..gggg..",
    "..b..b..",
    "..b..b..",
  ];
  const px = sprite
    .flatMap((row, y) => [...row].map((ch, x) => (ch === "." ? "" : `<rect x="${x * 3}" y="${y * 3}" width="3" height="3" fill="${{ o: "#f2c9a0", g: C.papaya, b: "#2d3a55" }[ch]}"/>`)))
    .join("");
  o.push(`<g class="res"><g class="bob"><g transform="translate(0 -6)">${px}</g></g></g>`);
  // Savings meter.
  d.css.push(`.sav{transform-box:fill-box;transform-origin:0 50%;animation:sav ${T}s cubic-bezier(.65,0,.35,1) infinite}@keyframes sav{0%,15%{transform:scaleX(.08)}30%{transform:scaleX(.3)}48%{transform:scaleX(.45)}66%{transform:scaleX(.58)}84%,96%{transform:scaleX(.82)}100%{transform:scaleX(.08)}}`);
  o.push(`<rect x="${RX + cols * P - 150}" y="${RY - 22}" width="150" height="8" rx="4" fill="${C.faint}"/><rect class="sav" x="${RX + cols * P - 150}" y="${RY - 22}" width="150" height="8" rx="4" fill="${C.green}"/>`);
  o.push(d.text("PLAN", { face: "monoBold", size: 10, x: RX + cols * P - 158, y: RY - 14, anchor: "end", fill: C.green, ls: 0.1 }).svg);
  o.push(d.text("Phaser 3, Next.js, React 19. Readings simulated, and labelled so.", { face: "mono", size: 10.5, x: 28, y: H - 18, fill: C.dim }).svg);
  return d.render(o.join("\n"));
}

// ---------------------------------------------------------------- NES finance tool
export function nes() {
  const W = 490;
  const H = 360;
  const d = new Doc(W, H, {
    title: "NES Finance Tool",
    desc: "NES Finance Tool: a procurement request moves through submit, classify, approve and record, and every step lands in an append-only audit log. Being built for the NUS Entrepreneurship Society.",
  });
  const o = [panel(d, { glow: C.purple })];
  o.push(d.text("TECHNICAL EXECUTIVE, NOW BUILDING", { face: "monoBold", size: 11, x: 28, y: 44, fill: C.dim, ls: 0.1 }).svg);
  o.push(d.text("NES Finance Tool", { face: "anton", size: 44, x: 26, y: 94, fill: C.paper }).svg);
  o.push(body(d, "Finance governance for the NUS Entrepreneurship Society. Tiered approvals; nobody signs off their own request.", 28, 120, W - 56, 14));

  const T = 9;
  const steps = ["Submit", "Classify", "Approve", "Record"];
  const NY = 196;
  const x0 = 52;
  const gap = (W - 2 * x0) / (steps.length - 1);
  o.push(`<line x1="${x0}" x2="${W - x0}" y1="${NY}" y2="${NY}" stroke="${C.faint}" stroke-width="2"/>`);
  d.css.push(`.prog{transform-box:fill-box;transform-origin:0 50%;animation:prog ${T}s cubic-bezier(.65,0,.35,1) infinite}@keyframes prog{0%,6%{transform:scaleX(0)}${steps.map((_, i) => `${r2(((0.6 + i * 1.6) / T) * 100)}%,${r2(((1.2 + i * 1.6) / T) * 100)}%{transform:scaleX(${r2(i / (steps.length - 1))})}`).join("")}92%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}`);
  o.push(`<line class="prog" x1="${x0}" x2="${W - x0}" y1="${NY}" y2="${NY}" stroke="${C.purple}" stroke-width="2.5"/>`);
  steps.forEach((s, i) => {
    const x = x0 + i * gap;
    const t = 0.6 + i * 1.6;
    const k = `nd${i}`;
    d.css.push(`.${k}{animation:${k} ${T}s ease infinite}@keyframes ${k}{0%,${r2(((t - 0.05) / T) * 100)}%{fill:${C.ink3};stroke:${C.faint}}${r2(((t + 0.15) / T) * 100)}%,95%{fill:${C.purple};stroke:${C.purple}}100%{fill:${C.ink3};stroke:${C.faint}}}`);
    o.push(`<circle class="${k}" cx="${x}" cy="${NY}" r="9" fill="${C.ink3}" stroke="${C.faint}" stroke-width="2"/>`);
    o.push(d.text(s, { face: "groteskBold", size: 13, x, y: NY + 30, anchor: "middle", fill: C.paper }).svg);
  });
  // Status chip under the line.
  const states = [
    ["SUBMITTED", C.paper],
    ["TIER 2 BY AMOUNT", C.gold],
    ["APPROVED, 2 OF 2", C.green],
    ["REF ISSUED", C.purple],
  ];
  // Audit log: lines appended, never edited.
  const log = ["request raised by member", "tier set from the amount", "approver is not requester", "committee sign-off", "sequential reference issued"];
  const LY = 258;
  o.push(`<rect x="28" y="${LY - 8}" width="${W - 56}" height="${H - LY - 28}" rx="8" fill="#000" fill-opacity=".35" stroke="${C.hair}"/>`);
  o.push(d.text("AUDIT TRAIL, APPEND-ONLY", { face: "monoBold", size: 9.5, x: W - 40, y: LY + 8, anchor: "end", fill: C.dim, ls: 0.1 }).svg);
  log.forEach((l, i) => {
    const t = 0.7 + i * 1.25;
    const k = `lg${i}`;
    d.css.push(`.${k}{animation:${k} ${T}s ease infinite}@keyframes ${k}{0%,${r2((t / T) * 100)}%{opacity:0;transform:translateX(-8px)}${r2(((t + 0.3) / T) * 100)}%,94%{opacity:1;transform:none}100%{opacity:0}}`);
    o.push(`<g class="${k}">${d.text(`+ ${l}`, { face: "mono", size: 11, x: 40, y: LY + 8 + i * 15, fill: i === log.length - 1 ? C.purple : C.paper }).svg}</g>`);
  });
  states.forEach(([s, col], i) => {
    const t = 0.6 + i * 1.6;
    const end = i < states.length - 1 ? 0.6 + (i + 1) * 1.6 : T - 0.6;
    d.css.push(window_(`st${i}`, t, end, T, 0.12));
    o.push(`<g class="st${i}">${d.text(s, { face: "monoBold", size: 10.5, x: W - 40, y: LY + 26, anchor: "end", fill: col, ls: 0.08 }).svg}</g>`);
  });
  o.push(d.text("Next.js, Postgres on Supabase, Drizzle. Rules unit-tested.", { face: "mono", size: 10.5, x: 28, y: H - 14, fill: C.dim }).svg);
  return d.render(o.join("\n"));
}
