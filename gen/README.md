# How the profile is drawn

Every image in `assets/` is an SVG written by `build.mjs`. No dependencies, Node 22+.

```bash
GITHUB_TOKEN=$(gh auth token) node gen/live.mjs   # refresh gen/data/live.json
node gen/build.mjs                                # redraw assets/*.svg (or: node gen/build.mjs wtp)
```

- **Text is set as paths.** GitHub shows README SVGs as images, which can't load web fonts, so `lib.mjs` lays text out from glyph outlines and kerning baked into `fonts/*.json` by `extract-glyphs.py` (needs `pip install fonttools uharfbuzz`; only rerun it to add a font or a character).
- **Animation is CSS keyframes plus a little SMIL** (`animateMotion` for the cars, clip wipes in the radio). No script runs in an image. Under `prefers-reduced-motion` the cards rest on their final frame.
- **Live numbers** (`live.mjs`): games reviewed from `whatsthisposition.com/api/reviewed`; languages from the public repos pushed in the last 12 months (the profile repo itself excluded); a year of contributions from the GraphQL API. A failed fetch keeps the last value.
- **The chess card** replays `data/opera-review.json`: Morphy's Opera Game as reviewed by whatsthisposition's own pipeline (`analysePositions` at depth 16, critical positions at 20, `classifyGame`, `explainReviewMove`). Regenerate it from that repo if its labels change.
- `.github/workflows/refresh.yml` runs both scripts daily and commits only when something changed. Add a `CONTRIB_TOKEN` secret (a personal token with `read:user`) to also count private contributions.
