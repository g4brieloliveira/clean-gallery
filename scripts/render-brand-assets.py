#!/usr/bin/env python3
"""Rasterize canonical Kleen mark geometry into Expo PNG assets.

Source of truth: the same numbers as src/components/KleenMark/geometry.ts
and assets/brand/kleen-mark*.svg
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

BRAND = (0x90, 0x88, 0xF0, 255)
INK = (0xF8, 0xF7, 0xFC, 255)
SIZE = 1024


def rounded_rect_polygon(
    x: float,
    y: float,
    w: float,
    h: float,
    rx: float,
    steps: int = 10,
) -> list[tuple[float, float]]:
    rx = min(rx, w / 2, h / 2)
    pts: list[tuple[float, float]] = []

    def arc(cx: float, cy: float, start: float, end: float) -> None:
        for i in range(steps + 1):
            t = start + (end - start) * (i / steps)
            pts.append((cx + rx * math.cos(t), cy + rx * math.sin(t)))

    arc(x + w - rx, y + rx, -math.pi / 2, 0)
    arc(x + w - rx, y + h - rx, 0, math.pi / 2)
    arc(x + rx, y + h - rx, math.pi / 2, math.pi)
    arc(x + rx, y + rx, math.pi, 3 * math.pi / 2)
    return pts


def rotate_points(
    pts: list[tuple[float, float]],
    angle_deg: float,
    origin: tuple[float, float],
) -> list[tuple[float, float]]:
    ang = math.radians(angle_deg)
    cos_a, sin_a = math.cos(ang), math.sin(ang)
    ox, oy = origin
    out: list[tuple[float, float]] = []
    for x, y in pts:
        dx, dy = x - ox, y - oy
        out.append((ox + dx * cos_a - dy * sin_a, oy + dx * sin_a + dy * cos_a))
    return out


def blit_polygon(
    canvas: Image.Image,
    pts: list[tuple[float, float]],
    fill: tuple[int, int, int, int],
) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(pts, fill=fill)
    canvas.alpha_composite(layer)


def blit_rounded_rect(
    canvas: Image.Image,
    *,
    x: float,
    y: float,
    w: float,
    h: float,
    rx: float,
    fill: tuple[int, int, int, int] | None,
    stroke: tuple[int, int, int, int] | None = None,
    stroke_width: float = 0,
    rotation: float = 0,
    origin: tuple[float, float] = (0, 0),
) -> None:
    outer = rotate_points(rounded_rect_polygon(x, y, w, h, rx), rotation, origin)
    if fill is not None:
        blit_polygon(canvas, outer, fill)
    if stroke is not None and stroke_width > 0:
        inset = stroke_width
        inner = rotate_points(
            rounded_rect_polygon(
                x + inset,
                y + inset,
                max(1.0, w - 2 * inset),
                max(1.0, h - 2 * inset),
                max(0.0, rx - inset),
            ),
            rotation,
            origin,
        )
        ring = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(ring).polygon(outer, fill=stroke)
        hole = Image.new("L", canvas.size, 0)
        ImageDraw.Draw(hole).polygon(inner, fill=255)
        r, g, b, a = ring.split()
        ring = Image.merge("RGBA", (r, g, b, ImageChops.subtract(a, hole)))
        canvas.alpha_composite(ring)


def draw_mark(
    *,
    symbol_only: bool,
    pad_scale: float = 1.0,
) -> Image.Image:
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    if not symbol_only:
        ImageDraw.Draw(canvas).rectangle((0, 0, SIZE, SIZE), fill=BRAND)

    mark = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    # Order matches kleen-mark.svg: solid card → outline card → swipe stem
    blit_rounded_rect(
        mark,
        x=205,
        y=184,
        w=532,
        h=471,
        rx=123,
        fill=INK,
        rotation=-7,
        origin=(471, 420),
    )
    blit_rounded_rect(
        mark,
        x=399,
        y=461,
        w=492,
        h=430,
        rx=123,
        # Keep outline fill brand purple so symbol matches kleen-mark.svg geometry.
        fill=BRAND,
        stroke=INK,
        stroke_width=32,
        rotation=7,
        origin=(645, 676),
    )
    blit_rounded_rect(
        mark,
        x=440,
        y=205,
        w=123,
        h=635,
        rx=62,
        fill=INK,
        rotation=-42,
        origin=(502, 522),
    )

    if pad_scale != 1.0:
        scaled = mark.resize(
            (round(SIZE * pad_scale), round(SIZE * pad_scale)),
            Image.Resampling.LANCZOS,
        )
        padded = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        padded.paste(
            scaled,
            ((SIZE - scaled.width) // 2, (SIZE - scaled.height) // 2),
            scaled,
        )
        canvas.alpha_composite(padded)
    else:
        canvas.alpha_composite(mark)
    return canvas


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> None:
    icon = draw_mark(symbol_only=False)
    save(icon, ASSETS / "icon.png")

    # Android adaptive foreground + Expo splash: symbol on transparent.
    symbol_padded = draw_mark(symbol_only=True, pad_scale=0.72)
    save(symbol_padded, ASSETS / "adaptive-icon.png")
    save(symbol_padded, ASSETS / "splash-icon.png")

    save(icon.resize((48, 48), Image.Resampling.LANCZOS), ASSETS / "favicon.png")
    save(icon, ASSETS / "brand" / "kleen-mark.png")
    save(draw_mark(symbol_only=True), ASSETS / "brand" / "kleen-mark-symbol.png")


if __name__ == "__main__":
    main()
