"""Bake glyph outlines + kerning for the profile's fonts into JSON, so build.mjs can
set text as SVG paths (GitHub shows README SVGs as images, which can't load fonts).

    python3 gen/extract-glyphs.py <dir with the Google Fonts TTFs>
needs: pip install fonttools uharfbuzz
"""
import json, sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "fonts")
CHARS = "".join(chr(c) for c in range(32, 127)) + "’‘“”—–·×↗→←↑★•…°±"

FACES = {
    "anton": ("Anton-Regular.ttf", None),
    "grotesk": ("SpaceGrotesk[wght].ttf", {"wght": 500}),
    "groteskBold": ("SpaceGrotesk[wght].ttf", {"wght": 700}),
    "mono": ("JetBrainsMono[wght].ttf", {"wght": 500}),
    "monoBold": ("JetBrainsMono[wght].ttf", {"wght": 800}),
    "archivo": ("Archivo[wdth,wght].ttf", {"wght": 800, "wdth": 100}),
}

def rnd(s):
    # Trim decimals in the path data.
    import re
    return re.sub(r"-?\d+\.\d+", lambda m: str(round(float(m.group()), 1)).rstrip("0").rstrip("."), s)

for name, (file, axes) in FACES.items():
    path = os.path.join(SRC, file)
    font = TTFont(path)
    if axes:
        font = instantiateVariableFont(font, axes)
    tmp = os.path.join(OUT, f".{name}.ttf")
    font.save(tmp)
    blob = hb.Blob.from_file_path(tmp)
    hbfont = hb.Font(hb.Face(blob))
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    upem = font["head"].unitsPerEm
    glyphs = {}
    for ch in CHARS:
        gname = cmap.get(ord(ch))
        if not gname:
            continue
        pen = SVGPathPen(gs)
        # Flip y so the outline is in SVG orientation (y down), baseline at 0.
        gs[gname].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))
        glyphs[ch] = {"d": rnd(pen.getCommands()), "a": gs[gname].width}
    # Kerning: shape every pair and keep the difference from the plain advances.
    kern = {}
    have = [c for c in CHARS if c in glyphs and c != " "]
    for a in have:
        for b in have:
            buf = hb.Buffer(); buf.add_str(a + b); buf.guess_segment_properties()
            hb.shape(hbfont, buf, {"kern": True, "liga": False})
            w = sum(p.x_advance for p in buf.glyph_positions)
            d = w - glyphs[a]["a"] - glyphs[b]["a"]
            if d:
                kern[a + b] = d
    os.remove(tmp)
    os2 = font["OS/2"]
    data = {"upem": upem, "asc": os2.sTypoAscender, "desc": os2.sTypoDescender, "cap": getattr(os2, "sCapHeight", 0), "x": getattr(os2, "sxHeight", 0), "glyphs": glyphs, "kern": kern}
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(name, len(glyphs), "glyphs", len(kern), "kern pairs", os.path.getsize(os.path.join(OUT, f"{name}.json")) // 1024, "KB")
