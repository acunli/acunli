// whatsthisposition: Morphy's Opera Game plays itself with the labels, evals and
// explanations the site's own engine gave it (gen/data/opera-review.json).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C, Doc, panel, r2, wrap, window_ } from "../lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W_ = { bg: "#0c110f", bone: "#f1ede2", dim: "rgba(241,237,226,.58)", brand: "#ff7629", red: "#ff4b3e", light: "#eae6d6", dark: "#5e8a6f", disc: "#151c19" };
const KNIGHT_BASE = "M6.5422 294.1782c1.0776 0 1.1247.8573 1.1247 1.4946H2.0688c0-.649.0465-1.4946 1.1241-1.4946z";
const KNIGHT_HEAD =
  "M6.4242 293.7612H3.3096c.0424-1.2235 1.357-1.8739 1.4169-2.4641.0598-.5903-.208-.7423-.208-.7423s-.1836.7095-.4175.8545c-.234.145-.7784.2813-.7784.2813s-.382.3571-.6072.3323c-.2252-.025-.4179-.5822-.4179-.5822l.7646-1.261.3874-.894.3656-.413.1566-.6066.4401.5334c2.4231 0 2.9485 3.2354 2.0124 4.9617";
// The site's badge glyphs (src/lib/review/classGlyphs.ts), in a 24×24 box.
const BADGE_PATH = {
  best: "M12 4.2l2.3 4.9 5.3.6-3.9 3.6 1 5.3L12 16l-4.7 2.6 1-5.3-3.9-3.6 5.3-.6z",
  excellent: "M8 11v8H5v-8zM10 19h6.6a2 2 0 002-1.6l1.1-5.3A1.8 1.8 0 0017.9 10H14.5l.6-3a1.7 1.7 0 00-3.1-1.2L10 10.5z",
  good: "M6 12.5l4 4 8-9",
  book: "M4 6.5c2.7-1 5.3-.8 8 .9 2.7-1.7 5.3-1.9 8-.9V18c-2.7-1-5.3-.8-8 .9-2.7-1.7-5.3-1.9-8-.9zM12 7.4v11.5",
  miss: "M7 7l10 10M17 7L7 17",
  forced: "M5 12h12M13 7l5 5-5 5",
};
const BADGE_TEXT = { brilliant: "!!", great: "!", inaccuracy: "?!", mistake: "?", blunder: "??" };
const STROKED = new Set(["good", "book", "miss", "forced"]);

const START = {
  a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
  a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR",
};
for (const f of "abcdefgh") {
  START[`${f}2`] = "wP";
  START[`${f}7`] = "bP";
}

export function wtp(live, review) {
  const W = 1000;
  const H = 664;
  const d = new Doc(W, H, {
    title: "whatsthisposition: free, open-source chess game review",
    desc: `Morphy's Opera Game (1858) plays on a board while whatsthisposition labels every move: 10.Nxb5 and 16.Qb8+ are Brilliant, 15…Nxd7 is a Blunder. Accuracy: White ${review.accuracy.w}, Black ${review.accuracy.b}. ${live.gamesReviewed.toLocaleString("en-US")} games reviewed on the site.`,
  });
  const o = [panel(d, { fill: W_.bg, glow: W_.brand })];
  const SQ = 55;
  const BX = 72;
  const BY = 122;

  // ---- timeline ----
  const moves = review.moves;
  const slow = { brilliant: 3.0, blunder: 2.8, great: 2.0, mistake: 2.0 };
  const times = [];
  let t = 1.4;
  for (const m of moves) {
    times.push(t);
    t += slow[m.cls] ?? (m.cls === "book" ? 0.75 : 1.05);
  }
  const T = r2(times.at(-1) + 6.5);
  const MV = 0.34; // slide time
  const pct = (s) => `${r2((Math.max(0, Math.min(T, s)) / T) * 100)}%`;

  // ---- header: the logo, drawn the way the site draws it ----
  d.css.push(
    `.mk-ring{stroke-dasharray:1;stroke-dashoffset:1;animation:mkr 1.2s cubic-bezier(.65,0,.35,1) .2s both}@keyframes mkr{to{stroke-dashoffset:0}}`,
    `.mk-tick{animation:mkt .5s cubic-bezier(.34,1.56,.64,1) 1.1s both;transform-box:view-box;transform-origin:24px 24px}@keyframes mkt{from{opacity:0;transform:scale(1.35)}to{opacity:1;transform:none}}`,
    `.mk-kn{animation:mkk .8s cubic-bezier(.16,1,.3,1) .5s both}@keyframes mkk{from{transform:translateY(18px)}to{transform:none}}`,
    `.mk-scan{animation:mks 7s ease-in-out 1.6s infinite}@keyframes mks{0%{transform:translateY(-6px);opacity:0}4%{opacity:.9}18%{transform:translateY(46px);opacity:.9}20%,100%{transform:translateY(46px);opacity:0}}`,
    `.mk-dot{animation:mkd .4s cubic-bezier(.34,1.56,.64,1) 1.4s both;transform-box:fill-box;transform-origin:center}@keyframes mkd{from{transform:scale(0)}to{transform:none}}`,
  );
  d.defs.push(`<clipPath id="lens"><circle cx="24" cy="24" r="17"/></clipPath>`);
  o.push(`<g transform="translate(36 30) scale(1.2)">
<circle cx="24" cy="24" r="17" fill="${W_.disc}"/>
<g clip-path="url(#lens)"><g class="mk-kn"><g transform="translate(5.6 4.4) scale(3.7)"><g transform="matrix(1.07361 0 0 1 -.233 -286.97)" fill="${W_.bone}"><path d="${KNIGHT_BASE}"/><path d="${KNIGHT_HEAD}"/></g><circle cx="5.35" cy="4.05" r=".34" fill="${W_.disc}"/></g></g>
<rect class="mk-scan" x="4" y="0" width="40" height="3" fill="${W_.brand}" opacity="0"/></g>
<circle class="mk-ring" cx="24" cy="24" r="20" pathLength="1" fill="none" stroke="${W_.brand}" stroke-width="2.2" transform="rotate(-90 24 24)"/>
<path class="mk-tick" d="M24 1.5v5M24 41.5v5M1.5 24h5M41.5 24h5" stroke="${W_.brand}" stroke-width="2.2" stroke-linecap="round"/>
<circle class="mk-dot" cx="38.2" cy="9.8" r="3.2" fill="${W_.red}"/></g>`);
  const wm1 = d.text("what’sthis", { face: "archivo", size: 36, x: 108, y: 70, fill: W_.bone });
  o.push(wm1.svg, d.text("position", { face: "archivo", size: 36, x: 108 + wm1.w, y: 70, fill: W_.brand }).svg);
  o.push(d.text("Free, open-source chess game review. Stockfish 19 runs in your browser.", { face: "grotesk", size: 15, x: 109, y: 95, fill: W_.dim }).svg);
  o.push(d.text("GAMES REVIEWED", { face: "monoBold", size: 11, x: W - 40, y: 44, anchor: "end", fill: W_.dim, ls: 0.1 }).svg);
  o.push(d.odometer(live.gamesReviewed.toLocaleString("en-US"), { face: "archivo", size: 46, x: W - 40, y: 92, anchor: "end", fill: W_.brand, delay: 0.6, dur: 2.6, spins: 2 }).svg);

  // ---- board ----
  const sqXY = (s) => [(s.charCodeAt(0) - 97) * SQ, (8 - Number(s[1])) * SQ];
  const squares = [];
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) squares.push(`<rect x="${f * SQ}" y="${r * SQ}" width="${SQ}" height="${SQ}" fill="${(r + f) % 2 ? W_.dark : W_.light}"/>`);
  const coords = [];
  for (let i = 0; i < 8; i++) {
    coords.push(d.text("abcdefgh"[i], { face: "monoBold", size: 10, x: i * SQ + SQ - 4, y: 8 * SQ - 4, anchor: "end", fill: i % 2 ? W_.dark : W_.light }).svg);
    coords.push(d.text(String(8 - i), { face: "monoBold", size: 10, x: 3, y: i * SQ + 12, fill: i % 2 ? W_.dark : W_.light }).svg);
  }

  // Pieces as symbols, from the site's own set.
  for (const p of ["wK", "wQ", "wR", "wB", "wN", "wP", "bK", "bQ", "bR", "bB", "bN", "bP"]) {
    const raw = readFileSync(join(HERE, "..", "pieces", `${p}.svg`), "utf8");
    const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    d.defs.push(`<symbol id="${p}" viewBox="0 0 10 10">${inner}</symbol>`);
  }

  // Replay the game, tracking each piece by where it started.
  const board = {};
  const pieces = {};
  for (const [sq, kind] of Object.entries(START)) {
    board[sq] = sq;
    pieces[sq] = { kind, at: sq, path: [[0, sq]], captured: null };
  }
  moves.forEach((m, i) => {
    const from = m.uci.slice(0, 2);
    const to = m.uci.slice(2, 4);
    const id = board[from];
    const p = pieces[id];
    let capSq = board[to] ? to : null;
    if (!capSq && p.kind[1] === "P" && from[0] !== to[0]) capSq = `${to[0]}${from[1]}`; // en passant
    if (capSq) {
      pieces[board[capSq]].captured = times[i] + MV * 0.7;
      delete board[capSq];
    }
    p.path.push([times[i], to]);
    delete board[from];
    board[to] = id;
    if (p.kind[1] === "K" && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
      const long = to[0] === "c";
      const rf = `${long ? "a" : "h"}${from[1]}`;
      const rt = `${long ? "d" : "f"}${from[1]}`;
      const rid = board[rf];
      pieces[rid].path.push([times[i] + 0.12, rt]);
      delete board[rf];
      board[rt] = rid;
    }
  });

  const pieceSvg = [];
  for (const [id, p] of Object.entries(pieces)) {
    const k = `p${id}`;
    const stops = [];
    let prev = p.path[0][1];
    const tr = (sq) => {
      const [x, y] = sqXY(sq);
      return `transform:translate(${x}px,${y}px)`;
    };
    stops.push(`0%{${tr(prev)}}`);
    for (const [tt, sq] of p.path.slice(1)) {
      stops.push(`${pct(tt)}{${tr(prev)}}`, `${pct(tt + MV)}{${tr(sq)}}`);
      prev = sq;
    }
    stops.push(`100%{${tr(prev)}}`);
    const anims = [`${k} ${T}s cubic-bezier(.3,.7,.25,1) infinite`];
    let css = `@keyframes ${k}{${stops.join("")}}`;
    if (p.captured) {
      css += `@keyframes ${k}c{0%,${pct(p.captured)}{opacity:1}${pct(p.captured + 0.12)},100%{opacity:0}}`;
      anims.push(`${k}c ${T}s linear infinite`);
    }
    // Without motion: the final position.
    const [fx, fy] = sqXY(prev);
    d.css.push(`.${k}{transform:translate(${fx}px,${fy}px);${p.captured ? "opacity:0;" : ""}animation:${anims.join(",")}}${css}`);
    pieceSvg.push(`<g class="${k}"><use href="#${p.kind}" width="${SQ}" height="${SQ}"/></g>`);
  }

  // Last-move squares and badges.
  const hiFrom = [`0%{opacity:0}`];
  const hiTo = [];
  const hlStops = (which) =>
    moves
      .map((m, i) => {
        const [x, y] = sqXY(which === "from" ? m.uci.slice(0, 2) : m.uci.slice(2, 4));
        return `${pct(times[i] + 0.02)}{opacity:1;transform:translate(${x}px,${y}px)}`;
      })
      .join("");
  for (const which of ["from", "to"]) {
    const [x0, y0] = sqXY(which === "from" ? "a1" : "a1");
    d.css.push(
      `.hl-${which}{opacity:0;animation:hl-${which} ${T}s steps(1,end) infinite}@keyframes hl-${which}{0%{opacity:0;transform:translate(${x0}px,${y0}px)}${pct(times[0])}{opacity:0;transform:translate(${x0}px,${y0}px)}${hlStops(which)}${pct(T - 0.6)}{opacity:0}100%{opacity:0}}`,
    );
  }
  void hiFrom;
  void hiTo;

  const badge = (cls, r) => {
    const col = review.classes[cls].color;
    const s = (r * 2) / 24;
    let glyph = "";
    if (BADGE_TEXT[cls]) {
      const txt = BADGE_TEXT[cls];
      glyph = d.text(txt, { face: "archivo", size: r * (txt.length > 1 ? 0.98 : 1.2), x: 0, y: r * 0.4, anchor: "middle", fill: "#fff", ls: txt.length > 1 ? -0.05 : 0 }).svg;
    } else if (BADGE_PATH[cls]) {
      glyph = STROKED.has(cls)
        ? `<path transform="translate(${-r} ${-r}) scale(${r2(s)})" d="${BADGE_PATH[cls]}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path transform="translate(${-r} ${-r}) scale(${r2(s)})" d="${BADGE_PATH[cls]}" fill="#fff"/>`;
    }
    return `<circle r="${r}" fill="${col}"/><circle r="${r}" fill="none" stroke="#000" stroke-opacity=".18"/>${glyph}`;
  };

  const badges = [];
  moves.forEach((m, i) => {
    const end = i < moves.length - 1 ? times[i + 1] : T - 0.6;
    const k = `bg${i}`;
    d.css.push(
      window_(k, times[i] + MV - 0.05, end, T, 0.05),
      `.${k} > g{transform-box:fill-box;transform-origin:center;animation:${k}p ${T}s infinite}@keyframes ${k}p{0%,${pct(times[i] + MV - 0.05)}{transform:scale(0)}${pct(times[i] + MV + 0.18)}{transform:scale(1.25)}${pct(times[i] + MV + 0.32)},100%{transform:scale(1)}}`,
    );
    const [x, y] = sqXY(m.uci.slice(2, 4));
    badges.push(`<g class="${k}"><g><g transform="translate(${x + SQ - 4} ${y + 4})">${badge(m.cls, 12)}</g></g></g>`);
  });

  d.css.push(`.bd{animation:bd ${T}s linear infinite}@keyframes bd{0%{opacity:0}${pct(0.5)},${pct(T - 0.7)}{opacity:1}100%{opacity:0}}`);
  o.push(`<g transform="translate(${BX} ${BY})">
<rect x="-3" y="-3" width="${8 * SQ + 6}" height="${8 * SQ + 6}" rx="6" fill="#000" opacity=".35"/>
${squares.join("")}${coords.join("")}
<g class="hl-from"><rect width="${SQ}" height="${SQ}" fill="#ffc53d" opacity=".34"/></g>
<g class="hl-to"><rect width="${SQ}" height="${SQ}" fill="#ffc53d" opacity=".5"/></g>
<g class="bd">${pieceSvg.join("")}${badges.join("")}</g>
</g>`);

  // ---- eval bar ----
  const frac = (e) => {
    if (e.kind === "mate") return e.winner === "w" ? 1 : 0;
    const wc = 2 / (1 + Math.exp(-0.00368208 * e.cp)) - 1;
    return Math.max(0.04, Math.min(0.96, 0.5 + wc / 2));
  };
  const evStops = [`0%{transform:scaleY(.5)}`, `${pct(times[0])}{transform:scaleY(.5)}`];
  moves.forEach((m, i) => {
    evStops.push(`${pct(times[i] + MV + 0.25)}{transform:scaleY(${r2(frac(m.evalAfter))})}`);
  });
  evStops.push(`${pct(T - 0.7)}{transform:scaleY(1)}`, `100%{transform:scaleY(.5)}`);
  d.css.push(`.evw{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(1);animation:evw ${T}s cubic-bezier(.3,.7,.25,1) infinite}@keyframes evw{${evStops.join("")}}`);
  o.push(`<g transform="translate(40 ${BY})"><rect width="22" height="${8 * SQ}" rx="4" fill="#2a2f2c"/><rect class="evw" width="22" height="${8 * SQ}" rx="4" fill="${W_.bone}"/><line x1="0" x2="22" y1="${4 * SQ}" y2="${4 * SQ}" stroke="${W_.brand}" stroke-opacity=".7"/></g>`);

  // ---- right column ----
  const RX = 548;
  const RW = W - 40 - RX;
  o.push(d.text("Morphy vs Duke Karl & Count Isouard", { face: "groteskBold", size: 20, x: RX, y: 140, fill: W_.bone }).svg);
  o.push(d.text("Paris Opera, 1858. Philidor Defence.", { face: "grotesk", size: 14.5, x: RX, y: 163, fill: W_.dim }).svg);
  // Accuracy.
  o.push(`<rect x="${RX}" y="180" width="${RW}" height="52" rx="10" fill="#fff" fill-opacity=".04" stroke="${C.hair}"/>`);
  o.push(d.text("ACCURACY", { face: "monoBold", size: 11, x: RX + 16, y: 211, fill: W_.dim, ls: 0.1 }).svg);
  o.push(`<rect x="${RX + 120}" y="193" width="18" height="18" rx="4" fill="${W_.bone}"/>`);
  o.push(d.odometer(String(review.accuracy.w), { face: "archivo", size: 24, x: RX + 146, y: 216, fill: W_.bone, delay: 1, dur: 2 }).svg);
  o.push(`<rect x="${RX + 236}" y="193" width="18" height="18" rx="4" fill="#20231f" stroke="${W_.dim}"/>`);
  o.push(d.odometer(String(review.accuracy.b), { face: "archivo", size: 24, x: RX + 262, y: 216, fill: W_.bone, delay: 1.15, dur: 2 }).svg);

  // The move card: one per move, shown while that move is the latest.
  const CY = 248;
  o.push(`<rect x="${RX}" y="${CY}" width="${RW}" height="136" rx="12" fill="#fff" fill-opacity=".05" stroke="${C.hair}"/>`);
  const evalText = (e, mover) => {
    if (e.kind === "mate") return e.moves === 0 ? "Checkmate" : `${e.winner === "w" ? "White" : "Black"} mates in ${e.moves}`;
    const v = e.cp / 100;
    return `Eval ${v > 0 ? "+" : ""}${v.toFixed(2)}`;
  };
  const cards = [];
  // Before the first move.
  d.css.push(window_("cd-s", 0, times[0] + MV, T, 0.1));
  cards.push(`<g class="cd-s">${d.text("The game everyone learns first.", { face: "groteskBold", size: 17, x: RX + 20, y: CY + 44, fill: W_.bone }).svg}${d.text("Watch the engine label it, move by move.", { face: "grotesk", size: 14.5, x: RX + 20, y: CY + 70, fill: W_.dim }).svg}</g>`);
  moves.forEach((m, i) => {
    const k = `cd${i}`;
    const end = i < moves.length - 1 ? times[i + 1] + MV - 0.12 : T - 0.7;
    d.css.push(window_(k, times[i] + MV, end, T, 0.1));
    const info = review.classes[m.cls];
    const num = Math.ceil(m.ply / 2);
    const san = `${num}${m.ply % 2 ? "." : "…"}${m.san}`;
    const sanSvg = d.text(san, { face: "anton", size: 30, x: RX + 66, y: CY + 46, fill: W_.bone });
    const parts = [`<g transform="translate(${RX + 36} ${CY + 35})">${badge(m.cls, 18)}</g>`, sanSvg.svg];
    parts.push(d.text(info.label, { face: "groteskBold", size: 18, x: RX + 66 + sanSvg.w + 12, y: CY + 45, fill: info.color }).svg);
    parts.push(d.text(evalText(m.evalAfter), { face: "mono", size: 12.5, x: RX + RW - 18, y: CY + 44, anchor: "end", fill: W_.dim }).svg);
    // The site's own words: the first point, else the headline.
    const point = m.story.points?.[0]?.text;
    const headline = m.story.headline.replace(/^\S+ (is|was) /, "").replace(/^./, (c) => c.toUpperCase());
    const lines = [];
    const h = ["brilliant", "great", "blunder", "mistake", "inaccuracy"].includes(m.cls) || !point ? m.story.headline : null;
    if (h) lines.push(...wrap(h, "groteskBold", 14.5, RW - 40).map((l) => [l, "groteskBold", W_.bone]));
    if (point) lines.push(...wrap(point, "grotesk", 14.5, RW - 40).map((l) => [l, "grotesk", h ? W_.dim : W_.bone]));
    void headline;
    lines.slice(0, 3).forEach(([l, face, fill], j) => parts.push(d.text(l, { face, size: 14.5, x: RX + 20, y: CY + 80 + j * 20, fill }).svg));
    cards.push(`<g class="${k}">${parts.join("")}</g>`);
  });
  o.push(cards.join(""));

  // Move list in two blocks; each move lights up when played, the latest is boxed.
  const LY = CY + 156;
  const rows = Math.ceil(moves.length / 2);
  const half = Math.ceil(rows / 2);
  const cell = (ply) => {
    const row = Math.ceil(ply / 2) - 1;
    const block = row < half ? 0 : 1;
    const x = RX + block * (RW / 2) + 30 + (ply % 2 ? 0 : 82);
    const y = LY + (row % half) * 21;
    return [x, y];
  };
  const list = [];
  for (let r = 0; r < rows; r++) {
    const [x, y] = cell(r * 2 + 1);
    list.push(d.text(`${r + 1}.`, { face: "mono", size: 13, x: x - 8, y: y + 15, anchor: "end", fill: "rgba(241,237,226,.32)" }).svg);
  }
  const box = moves.map((m, i) => {
    const [x, y] = cell(m.ply);
    return `${pct(times[i] + 0.02)}{opacity:1;transform:translate(${x - 6}px,${y}px)}`;
  });
  d.css.push(`.mvbox{opacity:0;animation:mvbox ${T}s steps(1,end) infinite}@keyframes mvbox{0%{opacity:0}${box.join("")}${pct(T - 0.6)}{opacity:0}100%{opacity:0}}`);
  list.push(`<g class="mvbox"><rect width="80" height="20" rx="5" fill="${W_.brand}" fill-opacity=".16" stroke="${W_.brand}" stroke-opacity=".6"/></g>`);
  moves.forEach((m, i) => {
    const [x, y] = cell(m.ply);
    const k = `ml${i}`;
    d.css.push(`.${k}{animation:${k} ${T}s steps(1,end) infinite}@keyframes ${k}{0%{opacity:.28}${pct(times[i] + 0.02)}{opacity:1}${pct(T - 0.6)}{opacity:.28}100%{opacity:.28}}`);
    list.push(`<g class="${k}"><circle cx="${x + 2}" cy="${y + 10.5}" r="4" fill="${review.classes[m.cls].color}"/>${d.text(m.san, { face: "mono", size: 13, x: x + 12, y: y + 15, fill: W_.bone }).svg}</g>`);
  });
  o.push(list.join(""));

  // ---- caption ----
  o.push(`<line x1="40" x2="${W - 40}" y1="${H - 52}" y2="${H - 52}" stroke="${C.hair}"/>`);
  o.push(d.text("Labels, accuracy and explanations by the site's own engine: Stockfish 19 at depth 16, critical moments re-searched at 20.", { face: "grotesk", size: 13, x: 40, y: H - 26, fill: W_.dim }).svg);

  // Without motion: the final move's card and badge stay up.
  const last = moves.length - 1;
  d.css.push(`@media (prefers-reduced-motion:reduce){.cd${last},.bg${last}{opacity:1}}`);
  return d.render(o.join("\n"));
}
