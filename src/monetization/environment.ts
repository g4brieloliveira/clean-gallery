import { NativeModules, Platform } from 'react-native';

/**
 * RevenueCat Paywalls / Customer Center need a development build with native
 * modules. Expo Go only ships Preview API mode, which tries a browser path and
 * crashes with "document is not available" on native.
 */
export function isRevenueCatNativeUiAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  return Boolean(NativeModules.RNPaywalls && NativeModules.RNCustomerCenter);
}

export function isExpoGoPreviewMode(): boolean {
  if (isRevenueCatNativeUiAvailable()) return false;
  const expoGo = (
    globalThis as { expo?: { modules?: { ExpoGo?: unknown } } }
  ).expo?.modules?.ExpoGo;
  return Boolean(expoGo) || Platform.OS !== 'web';
}
