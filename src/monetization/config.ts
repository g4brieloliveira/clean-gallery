/**
 * RevenueCat / Store product configuration for Kleen Pro.
 *
 * Dashboard checklist:
 * 1. Entitlement id must match PRO_ENTITLEMENT_ID
 * 2. Products: lifetime (non-consumable), yearly, monthly
 * 3. Attach all three products to the Pro entitlement
 * 4. Current Offering packages: lifetime, yearly, monthly
 * 5. Attach a Paywall + Customer Center to that Offering
 */

export const PRO_ENTITLEMENT_ID =
  'create_an_app_called_kleen_swipe_photo_cleaner_pro';

/** Public SDK test key (safe in the client). Replace with appl_/goog_ for store builds. */
export const REVENUECAT_API_KEY_TEST = 'test_LLMxFyecKwbrkhVDGaGEwODfLOy';

export const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? REVENUECAT_API_KEY_TEST;

export const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? REVENUECAT_API_KEY_TEST;

/** Package identifiers expected on the current Offering. */
export const OFFERING_PACKAGE_IDS = {
  lifetime: 'lifetime',
  yearly: 'yearly',
  monthly: 'monthly',
} as const;

export type OfferingPackageId =
  (typeof OFFERING_PACKAGE_IDS)[keyof typeof OFFERING_PACKAGE_IDS];
