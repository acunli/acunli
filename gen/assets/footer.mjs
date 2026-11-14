// The finish: a chequered flag, the ask, and link buttons (one image per link).
import { C, Doc, panel, r2, wrap } from "../lib.mjs";

export function footer() {
  const W = 1000;
  const H = 300;
  const d = new Doc(W, H, {
    title: "Let's build something",
    desc: "Looking for AI/ML internships and projects worth building. Off track: chess (1500 peak rapid), Chelsea, McLaren, cricket, badminton, tennis and table tennis.",
  });
  const o = [panel(d)];

  // Chequered flag: columns ripple out of phase, like cloth.
  const FX = 650;
  const FY = 56;
  const S = 24;
  const cols = 11;
  const rows = 7;
  const flag = [];
  const P = 2.2; // seconds per ripple
  for (let c = 0; c < cols; c++) {
    const k = `fc${c}`;
    const amp = r2(2 + c * 0.9); // the free end flaps more
    const delay = r2(-c * 0.16);
    d.css.push(
      `.${k}{animation:${k} ${P}s ease-in-out ${delay}s infinite}@keyframes ${k}{0%,100%{transform:translateY(${-amp}px)}50%{transform:translateY(${amp}px)}}`,
      `.${k}s{animation:${k}s ${P}s ease-in-out ${delay}s infinite}@keyframes ${k}s{0%,100%{opacity:.04}50%{opacity:.38}}`,
    );
    const sq = [`<rect x="${FX + c * S}" y="${FY}" width="${S + 0.6}" height="${rows * S}" fill="#050507"/>`];
    for (let r = 0; r < rows; r++) if ((r + c) % 2 === 0) sq.push(`<rect x="${FX + c * S}" y="${FY + r * S}" width="${S + 0.6}" height="${S}" fill="${C.paper}"/>`);
    sq.push(`<rect class="${k}s" x="${FX + c * S}" y="${FY}" width="${S + 0.6}" height="${rows * S}" fill="#000"/>`);
    flag.push(`<g class="${k}">${sq.join("")}</g>`);
  }
  o.push(`<rect x="${FX - 8}" y="${FY - 12}" width="6" height="${H - FY - 10}" rx="3" fill="${C.dim}"/><g>${flag.join("")}</g>`);

  o.push(d.text("Let's build", { face: "anton", size: 66, x: 38, y: 110, fill: C.paper }).svg);
  o.push(d.text("something.", { face: "anton", size: 66, x: 38, y: 182, fill: C.papaya }).svg);
  wrap("Looking for AI/ML internships and projects worth building. Hackathon team, research idea, or a problem that needs a model: get in touch.", "grotesk", 15, 540).forEach((l, i) =>
    o.push(d.text(l, { face: "grotesk", size: 15, x: 40, y: 220 + i * 22, fill: C.dim }).svg),
  );
  o.push(d.text("OFF TRACK  Chess, 1500 peak rapid. Chelsea. McLaren. Cricket, badminton, tennis.", { face: "mono", size: 11.5, x: 40, y: H - 28, fill: C.paper, opacity: 0.7 }).svg);
  return d.render(o.join("\n"));
}

export function button(text, sub, i) {
  const W = 236;
  const H = 64;
  const d = new Doc(W, H, { title: text, desc: `${text}: ${sub}` });
  const o = [panel(d, { r: 12, weave: false })];
  d.defs.push(`<clipPath id="b"><rect width="${W}" height="${H}" rx="12"/></clipPath>`);
  d.css.push(`.sh{animation:sh 6s cubic-bezier(.5,0,.5,1) ${r2(1 + i * 0.35)}s infinite}@keyframes sh{0%{transform:translateX(-80px) skewX(-20deg)}22%,100%{transform:translateX(${W + 40}px) skewX(-20deg)}}`);
  o.push(`<rect x="14" y="16" width="3" height="${H - 32}" rx="1.5" fill="${C.papaya}"/>`);
  o.push(d.text(text, { face: "groteskBold", size: 17, x: 28, y: 31, fill: C.paper }).svg);
  o.push(d.text(sub, { face: "mono", size: 11, x: 28, y: 48, fill: C.dim }).svg);
  o.push(d.text("↗", { face: "groteskBold", size: 20, x: W - 18, y: 39, anchor: "end", fill: C.papaya }).svg);
  o.push(`<g clip-path="url(#b)"><rect class="sh" x="0" y="0" width="34" height="${H}" fill="#fff" opacity=".07"/></g>`);
  return d.render(o.join("\n"));
}
