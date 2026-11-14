import { colors, radii, spacing, typography } from './tokens';

export const appTheme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type AppTheme = typeof appTheme;
