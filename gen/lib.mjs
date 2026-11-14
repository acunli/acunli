// Tiny SVG toolkit for the profile: text set as paths (README images can't load fonts),
// rolling odometer numbers, keyframe helpers and the shared palette.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const fontCache = {};
export function font(face) {
  return (fontCache[face] ??= JSON.parse(readFileSync(join(HERE, "fonts", `${face}.json`), "utf8")));
}

export const C = {
  ink: "#0A0A0D",
  ink2: "#121217",
  ink3: "#1A1A21",
  paper: "#EDEBE4",
  dim: "rgba(237,235,228,.56)",
  faint: "rgba(237,235,228,.14)",
  hair: "rgba(237,235,228,.09)",
  papaya: "#FF8000",
  flame: "#FF3B30",
  purple: "#B347F0",
  green: "#3DDC84",
  gold: "#FFC53D",
};

export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Width of `str` in user units. `ls` is extra letter spacing in em. */
export function measure(str, face, size, ls = 0) {
  const f = font(face);
  let w = 0;
  let prev = null;
  const chars = [...str];
  chars.forEach((ch, i) => {
    const g = f.glyphs[ch] ?? f.glyphs["?"];
    if (prev) w += f.kern[prev + ch] ?? 0;
    w += g.a + (i < chars.length - 1 ? ls * f.upem : 0);
    prev = ch;
  });
  return (w * size) / f.upem;
}

/** Splits `str` into lines no wider than `max`. */
export function wrap(str, face, size, max) {
  const out = [];
  let line = "";
  for (const word of str.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, face, size) > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

let uid = 0;
export const nextId = (p = "k") => `${p}${(uid++).toString(36)}`;

/** One SVG document: collects glyph definitions, CSS and gradients as assets are drawn. */
export class Doc {
  constructor(w, h, { title = "", desc = "" } = {}) {
    Object.assign(this, { w, h, title, desc });
    this.glyphs = new Map();
    this.css = [];
    this.defs = [];
  }

  glyph(face, ch) {
    const f = font(face);
    const g = f.glyphs[ch] ?? f.glyphs["?"];
    if (!g.d) return null;
    const id = `${face[0]}${face.length}${ch.codePointAt(0).toString(36)}`;
    this.glyphs.set(id, g.d);
    return id;
  }

  /**
   * Text as glyph references. Returns { svg, w, x0 }.
   * perChar(i, ch, x) may return an attribute string for that character's wrapper <g>
   * (for per-letter animation); otherwise the whole string is one group.
   */
  text(str, { face = "grotesk", size = 16, x = 0, y = 0, anchor = "start", ls = 0, fill = C.paper, cls = "", style = "", attrs = "", perChar = null, opacity } = {}) {
    const f = font(face);
    const s = size / f.upem;
    const w = measure(str, face, size, ls);
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    let pen = 0;
    let prev = null;
    const parts = [];
    [...str].forEach((ch, i) => {
      const g = f.glyphs[ch] ?? f.glyphs["?"];
      if (prev) pen += f.kern[prev + ch] ?? 0;
      const id = this.glyph(face, ch);
      if (id) {
        if (perChar) {
          const px = r2(x0 + pen * s);
          parts.push(`<g ${perChar(i, ch, px) ?? ""}><use href="#${id}" transform="translate(${px} ${r2(y)}) scale(${r2(s * 1000) / 1000})"/></g>`);
        } else parts.push(`<use href="#${id}" x="${Math.round(pen)}"/>`);
      }
      pen += g.a + ls * f.upem;
      prev = ch;
    });
    const op = opacity != null ? ` opacity="${opacity}"` : "";
    const c = cls ? ` class="${cls}"` : "";
    const st = style ? ` style="${style}"` : "";
    const svg = perChar
      ? `<g${c}${st} fill="${fill}"${op} ${attrs}>${parts.join("")}</g>`
      : `<g${c}${st}${op} ${attrs}><g transform="translate(${r2(x0)} ${r2(y)}) scale(${r2(s * 1000) / 1000})" fill="${fill}">${parts.join("")}</g></g>`;
    return { svg, w, x0 };
  }

  /**
   * A number that rolls into place, digit by digit, like a timing screen.
   * `value` is the finished string ("2,192", "#8", "94.9").
   */
  odometer(value, { face = "anton", size = 40, x = 0, y = 0, anchor = "start", fill = C.paper, delay = 0, dur = 1.6, spins = 1, stagger = 0.09, cls = "" } = {}) {
    const f = font(face);
    const s = size / f.upem;
    const digitW = Math.max(...[..."0123456789"].map((d) => f.glyphs[d].a)) * s;
    const chars = [...value];
    const widths = chars.map((ch) => (/\d/.test(ch) ? digitW : (f.glyphs[ch] ?? f.glyphs["?"]).a * s));
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
    const line = size * 1.08;
    const top = y - (f.cap || f.asc * 0.72) * s - size * 0.14;
    const clipId = nextId("oc");
    this.defs.push(`<clipPath id="${clipId}"><rect x="${r2(cx - 4)}" y="${r2(top)}" width="${r2(total + 8)}" height="${r2(y - top + size * 0.16)}"/></clipPath>`);
    const parts = [];
    const digits = chars.filter((c) => /\d/.test(c)).length;
    let di = 0;
    chars.forEach((ch, i) => {
      if (/\d/.test(ch)) {
        const d = Number(ch);
        const n = spins * 10 + d;
        const k = nextId("od");
        const col = [];
        for (let j = 0; j <= n; j++) {
          const id = this.glyph(face, String(j % 10));
          const gx = cx + (digitW - f.glyphs[String(j % 10)].a * s) / 2;
          col.push(`<use href="#${id}" transform="translate(${r2(gx)} ${r2(y + j * line)}) scale(${r2(s * 1000) / 1000})"/>`);
        }
        // Later digits settle later, like a mechanical counter.
        const dl = delay + (digits - 1 - di) * 0 + di * stagger;
        this.css.push(`.${k}{transform:translateY(${r2(-n * line)}px);animation:${k} ${dur}s cubic-bezier(.16,1,.3,1) ${r2(dl)}s both}@keyframes ${k}{from{transform:translateY(0)}to{transform:translateY(${r2(-n * line)}px)}}`);
        parts.push(`<g class="${k}">${col.join("")}</g>`);
        di++;
      } else {
        const id = this.glyph(face, ch);
        if (id) parts.push(`<use href="#${id}" transform="translate(${r2(cx)} ${r2(y)}) scale(${r2(s * 1000) / 1000})"/>`);
      }
      cx += widths[i];
    });
    return { svg: `<g clip-path="url(#${clipId})" fill="${fill}"${cls ? ` class="${cls}"` : ""}>${parts.join("")}</g>`, w: total };
  }

  render(body) {
    const glyphDefs = [...this.glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img" aria-labelledby="t d">
<title id="t">${esc(this.title)}</title><desc id="d">${esc(this.desc)}</desc>
<defs>${glyphDefs}${this.defs.join("")}</defs>
<style>${this.css.join("\n")}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
${body}
</svg>
`;
  }
}

/** The dark rounded panel every card sits on, with a faint carbon weave. */
export function panel(doc, { x = 0, y = 0, w = doc.w, h = doc.h, r = 22, weave = true, fill = C.ink, glow = C.papaya } = {}) {
  const pid = nextId("cw");
  const gid = nextId("pg");
  doc.defs.push(
    `<pattern id="${pid}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff" opacity=".018"/><rect x="4" y="4" width="4" height="4" fill="#fff" opacity=".018"/></pattern>`,
    `<radialGradient id="${gid}" cx=".85" cy="0" r="1.1"><stop offset="0" stop-color="${glow}" stop-opacity=".10"/><stop offset=".55" stop-color="${glow}" stop-opacity="0"/></radialGradient>`,
  );
  return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${C.faint}"/>
${weave ? `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="url(#${pid})"/>` : ""}
<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="url(#${gid})"/>`;
}

/** Keyframes from a list of [seconds, css] stops over a loop of `total` seconds. */
export function keyframes(name, stops, total) {
  const pct = (t) => `${r2((Math.max(0, Math.min(total, t)) / total) * 100)}%`;
  return `@keyframes ${name}{${stops.map(([t, css]) => `${pct(t)}{${css}}`).join("")}}`;
}

/** A small mono label in the panel's dim colour. */
export function label(doc, str, x, y, opts = {}) {
  return doc.text(str, { face: "mono", size: 12, x, y, fill: C.dim, ...opts }).svg;
}

/** CSS that shows an element only between `a` and `b` seconds of a `total`-second loop. */
export function window_(name, a, b, total, ramp = 0.12) {
  const p = (t) => r2((Math.max(0, Math.min(total, t)) / total) * 100);
  const stops = [`0%{opacity:0}`];
  if (a > 0) stops.push(`${p(a)}%{opacity:0}`);
  stops.push(`${p(a + ramp)}%{opacity:1}`, `${p(b)}%{opacity:1}`, `${p(b + ramp)}%{opacity:0}`, `100%{opacity:0}`);
  return `.${name}{opacity:0;animation:${name} ${total}s linear infinite}@keyframes ${name}{${stops.join("")}}`;
}
