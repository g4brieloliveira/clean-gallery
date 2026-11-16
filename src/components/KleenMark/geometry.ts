/** Canonical Kleen mark geometry — keep in sync with assets/brand/kleen-mark*.svg */

export const MARK_VIEWBOX = 1024;

export const BRAND_PRIMARY = '#9088F0';
export const BRAND_INK = '#F8F7FC';

/** Full-bleed app-icon plate (OS applies the squircle mask). */
export const plate = {
  x: 0,
  y: 0,
  width: MARK_VIEWBOX,
  height: MARK_VIEWBOX,
  fill: BRAND_PRIMARY,
} as const;

/** Solid photo card (upper-left). */
export const solidCard = {
  x: 205,
  y: 184,
  width: 532,
  height: 471,
  rx: 123,
  fill: BRAND_INK,
  rotation: -7,
  originX: 471,
  originY: 420,
} as const;

/** Outlined photo card (lower-right). */
export const outlineCard = {
  x: 399,
  y: 461,
  width: 492,
  height: 430,
  rx: 123,
  fill: BRAND_PRIMARY,
  stroke: BRAND_INK,
  strokeWidth: 32,
  rotation: 7,
  originX: 645,
  originY: 676,
} as const;

/** Diagonal swipe / negative-space K stem. */
export const swipeStem = {
  x: 440,
  y: 205,
  width: 123,
  height: 635,
  rx: 62,
  fill: BRAND_INK,
  rotation: -42,
  originX: 502,
  originY: 522,
} as const;
