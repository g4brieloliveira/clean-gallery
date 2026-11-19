import { Platform } from 'react-native';

/**
 * Google sample / test App IDs — safe for TestFlight internal testing.
 * Replace via EXPO_PUBLIC_ADMOB_* before App Store release (see docs/ADS.md).
 */
export const ADMOB_SAMPLE_IOS_APP_ID =
  'ca-app-pub-3940256099942544~1458002511';
export const ADMOB_SAMPLE_ANDROID_APP_ID =
  'ca-app-pub-3940256099942544~3347511713';

export const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() || ADMOB_SAMPLE_IOS_APP_ID;

export const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() ||
  ADMOB_SAMPLE_ANDROID_APP_ID;

/** Production rewarded unit IDs (optional). Empty → TestIds.REWARDED at runtime. */
export const ADMOB_IOS_REWARDED_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID?.trim() ?? '';

export const ADMOB_ANDROID_REWARDED_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID?.trim() ?? '';

export function resolveRewardedUnitId(testUnitId: string): string {
  if (__DEV__) return testUnitId;
  const fromEnv =
    Platform.OS === 'ios'
      ? ADMOB_IOS_REWARDED_UNIT_ID
      : ADMOB_ANDROID_REWARDED_UNIT_ID;
  return fromEnv.length > 0 ? fromEnv : testUnitId;
}
