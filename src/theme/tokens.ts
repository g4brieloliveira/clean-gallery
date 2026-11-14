/**
 * Design tokens aligned with the provided UI (dark theme).
 */
export const colors = {
  background: '#121212',
  backgroundPure: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  borderNeutral: '#E8E8E8',
  accentRed: '#FF4B4B',
  accentGreen: '#4CAF50',
  accentGreenHighlight: '#32D74B',
  overlayRed: 'rgba(255, 75, 75, 0.35)',
  overlayGreen: 'rgba(76, 175, 80, 0.35)',
  iconOnAccent: '#FFFFFF',
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
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  full: 9999,
} as const;

export const typography = {
  title: 22,
  subtitle: 15,
  body: 16,
  caption: 13,
  small: 12,
} as const;
