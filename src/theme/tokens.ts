/** Kleen design system — see docs/brand/BRAND_MANUAL.md. */
export const colors = {
  background: '#121219',
  backgroundPure: '#0D0D12',
  surface: '#1B1B24',
  surfaceElevated: '#252532',
  borderNeutral: '#363542',
  brandPrimary: '#9088F0',
  brandPressed: '#706ABB',
  brandSoft: '#BFBAF6',
  brandTint: 'rgba(144, 136, 240, 0.16)',
  textPrimary: '#F8F7FC',
  textSecondary: '#AAA8B6',
  textMuted: '#777583',
  keep: '#53C987',
  keepSoft: '#183A2A',
  remove: '#FF6B6B',
  removeSoft: '#3C2026',
  /* Compatibility aliases while legacy components migrate to semantic names. */
  accentRed: '#FF6B6B',
  accentGreen: '#53C987',
  accentGreenHighlight: '#53C987',
  overlayRed: 'rgba(255, 107, 107, 0.28)',
  overlayGreen: 'rgba(83, 201, 135, 0.28)',
  iconOnAccent: '#F8F7FC',
} as const;

export type ColorToken = (typeof colors)[keyof typeof colors];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 14,
  md: 16,
  lg: 24,
  xl: 28,
  full: 9999,
} as const;

export const typography = {
  display: 32,
  title: 24,
  section: 20,
  subtitle: 15,
  body: 16,
  caption: 13,
  small: 12,
} as const;
