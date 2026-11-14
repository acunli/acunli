// Draws every SVG in assets/ from gen/data. Run: node gen/build.mjs [only-this-one]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hero } from "./assets/hero.mjs";
import { wtp } from "./assets/wtp.mjs";
import { radio } from "./assets/radio.mjs";
import { clipcontext, wattlah, nes } from "./assets/garage.mjs";
import { results } from "./assets/results.mjs";
import { telemetry } from "./assets/telemetry.mjs";
import { footer, button } from "./assets/footer.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const live = JSON.parse(readFileSync(join(HERE, "data", "live.json"), "utf8"));
const review = JSON.parse(readFileSync(join(HERE, "data", "opera-review.json"), "utf8"));

const assets = {
  hero: () => hero(live),
  radio: () => radio(live),
  wtp: () => wtp(live, review),
  clipcontext: () => clipcontext(),
  wattlah: () => wattlah(),
  nes: () => nes(),
  results: () => results(),
  telemetry: () => telemetry(live),
  footer: () => footer(),
  "btn-site": () => button("ayushman.rocks", "portfolio", 0),
  "btn-linkedin": () => button("LinkedIn", "in/ayushman-chaudhuri", 1),
  "btn-medium": () => button("Medium", "writing", 2),
  "btn-chess": () => button("Play me", "10 min rapid, Chess.com", 3),
};

mkdirSync(join(ROOT, "assets"), { recursive: true });
const only = process.argv[2];
for (const [name, make] of Object.entries(assets)) {
  if (only && name !== only) continue;
  const svg = make();
  writeFileSync(join(ROOT, "assets", `${name}.svg`), svg);
  console.log(`${name}.svg  ${(svg.length / 1024).toFixed(0)} KB`);
}
