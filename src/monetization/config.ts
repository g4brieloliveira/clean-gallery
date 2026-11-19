/**
 * RevenueCat / Store product configuration for Kleen Pro.
 *
 * Dashboard checklist:
 * 1. Entitlement id must match PRO_ENTITLEMENT_ID
 * 2. ASC products (exact IDs below): lifetime non-consumable;
 *    monthly + yearly = Auto-Renewable Subscriptions (NOT consumable)
 * 3. Attach all three store products to the Pro entitlement
 * 4. Current Offering packages point at those store products
 * 5. Attach a Paywall + Customer Center to that Offering
 */

export const PRO_ENTITLEMENT_ID =
  'create_an_app_called_kleen_swipe_photo_cleaner_pro';

/** Public SDK test key — Expo Go / local only. Never use in TestFlight/store builds. */
export const REVENUECAT_API_KEY_TEST = 'test_LLMxFyecKwbrkhVDGaGEwODfLOy';

/**
 * Release/TestFlight builds must use `appl_` / `goog_`. Falling back to `test_`
 * makes RevenueCat force-quit the app with "Wrong API Key".
 */
function resolveSdkApiKey(
  fromEnv: string | undefined,
  platformPrefix: 'appl_' | 'goog_',
): string {
  const trimmed = fromEnv?.trim();
  if (trimmed && trimmed.startsWith(platformPrefix)) {
    return trimmed;
  }
  if (__DEV__) {
    return REVENUECAT_API_KEY_TEST;
  }
  // Production binary without a store key: leave empty so configure is skipped.
  return '';
}

export const REVENUECAT_API_KEY_IOS = resolveSdkApiKey(
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  'appl_',
);

export const REVENUECAT_API_KEY_ANDROID = resolveSdkApiKey(
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  'goog_',
);

/**
 * App Store Connect product IDs (exact). Monthly/yearly MUST be
 * Auto-Renewable Subscriptions in a subscription group — not consumables.
 */
export const STORE_PRODUCT_IDS = {
  lifetime: 'kleen_lifetime',
  yearly: 'kleen_yearly',
  monthly: 'kleen_monthly',
} as const;

export type StoreProductId =
  (typeof STORE_PRODUCT_IDS)[keyof typeof STORE_PRODUCT_IDS];

/**
 * Preferred RevenueCat package identifiers on the current Offering.
 * Packages may also use `$rc_*` defaults; store product IDs above are authoritative.
 */
export const OFFERING_PACKAGE_IDS = {
  lifetime: 'lifetime',
  yearly: 'yearly',
  monthly: 'monthly',
} as const;

export type OfferingPackageId =
  (typeof OFFERING_PACKAGE_IDS)[keyof typeof OFFERING_PACKAGE_IDS];
