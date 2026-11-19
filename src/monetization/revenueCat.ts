import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  OFFERING_PACKAGE_IDS,
  PRO_ENTITLEMENT_ID,
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
  STORE_PRODUCT_IDS,
  type OfferingPackageId,
  type StoreProductId,
} from './config';
import { isRevenueCatNativeUiAvailable } from './environment';
import type { PremiumStatus } from './policy';

export { isRevenueCatNativeUiAvailable } from './environment';

let configured = false;

export function isPremiumFromCustomerInfo(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
}

export function premiumStatusFromCustomerInfo(
  info: CustomerInfo,
): PremiumStatus {
  return isPremiumFromCustomerInfo(info) ? 'active' : 'inactive';
}

export async function configureRevenueCat(): Promise<void> {
  if (configured) return;

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

  const apiKey =
    Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('[revenueCat] missing API key — skipping configure');
    return;
  }

  await Purchases.configure({ apiKey });
  configured = true;
}

export function addPremiumStatusListener(
  onStatus: (status: PremiumStatus) => void,
): () => void {
  const listener = (info: CustomerInfo) => {
    onStatus(premiumStatusFromCustomerInfo(info));
  };
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export async function fetchPremiumStatus(): Promise<PremiumStatus> {
  try {
    const info = await Purchases.getCustomerInfo();
    return premiumStatusFromCustomerInfo(info);
  } catch (error) {
    console.warn('[revenueCat] getCustomerInfo failed', describeError(error));
    return 'unknown';
  }
}

export async function restorePremiumPurchases(): Promise<{
  readonly status: PremiumStatus;
  readonly info: CustomerInfo | null;
  readonly errorCode?: string;
}> {
  try {
    const info = await Purchases.restorePurchases();
    return { status: premiumStatusFromCustomerInfo(info), info };
  } catch (error) {
    console.warn('[revenueCat] restore failed', describeError(error));
    return {
      status: 'unknown',
      info: null,
      errorCode: purchasesErrorCode(error),
    };
  }
}

export async function presentKleenPaywall(): Promise<{
  readonly result: PAYWALL_RESULT;
  readonly status: PremiumStatus;
  readonly reason?: 'preview_api' | 'offerings_empty';
}> {
  // Expo Go Preview API routes paywalls through a browser SDK and throws
  // "document is not available". Skip and let the app show an in-app fallback.
  if (!isRevenueCatNativeUiAvailable()) {
    return {
      result: PAYWALL_RESULT.NOT_PRESENTED,
      status: await fetchPremiumStatus(),
      reason: 'preview_api',
    };
  }

  // Preflight StoreKit products so we show a clear in-app message instead of
  // RevenueCat's native "Error 23" alert when ASC products are missing.
  const offerings = await getCurrentOfferingPackages();
  const missingStoreProducts =
    offerings.missingStoreProducts.length ===
    Object.values(STORE_PRODUCT_IDS).length;
  if (
    !offerings.offeringId ||
    offerings.packages.length === 0 ||
    missingStoreProducts
  ) {
    console.warn(
      '[revenueCat] offerings empty or products missing from store',
      offerings,
    );
    return {
      result: PAYWALL_RESULT.ERROR,
      status: await fetchPremiumStatus(),
      reason: 'offerings_empty',
    };
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID,
    });
    const status = await fetchPremiumStatus();
    return { result: paywallResult, status };
  } catch (error) {
    console.warn('[revenueCat] presentPaywall failed', describeError(error));
    return {
      result: PAYWALL_RESULT.ERROR,
      status: await fetchPremiumStatus(),
      reason: 'offerings_empty',
    };
  }
}

export async function presentKleenCustomerCenter(options?: {
  readonly onStatus?: (status: PremiumStatus) => void;
}): Promise<'opened' | 'unavailable' | 'failed'> {
  if (!isRevenueCatNativeUiAvailable()) {
    return 'unavailable';
  }

  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: ({ customerInfo }) => {
          options?.onStatus?.(premiumStatusFromCustomerInfo(customerInfo));
        },
        onRestoreFailed: ({ error }) => {
          console.warn('[revenueCat] customer center restore failed', error);
        },
      },
    });
    return 'opened';
  } catch (error) {
    console.warn('[revenueCat] customer center failed', describeError(error));
    return 'failed';
  }
}

export async function getCurrentOfferingPackages(): Promise<{
  readonly offeringId: string | null;
  readonly packages: readonly {
    readonly identifier: string;
    readonly productId: string;
    readonly packageType: string;
  }[];
  readonly missingExpected: readonly OfferingPackageId[];
  readonly missingStoreProducts: readonly StoreProductId[];
}> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      return {
        offeringId: null,
        packages: [],
        missingExpected: Object.values(OFFERING_PACKAGE_IDS),
        missingStoreProducts: Object.values(STORE_PRODUCT_IDS),
      };
    }

    const packages = current.availablePackages.map((pkg: PurchasesPackage) => ({
      identifier: pkg.identifier,
      productId: pkg.product.identifier,
      packageType: String(pkg.packageType),
    }));

    const presentPackages = new Set(packages.map((pkg) => pkg.identifier));
    const presentProducts = new Set(packages.map((pkg) => pkg.productId));
    const missingExpected = (
      Object.values(OFFERING_PACKAGE_IDS) as OfferingPackageId[]
    ).filter((id) => !presentPackages.has(id));
    const missingStoreProducts = (
      Object.values(STORE_PRODUCT_IDS) as StoreProductId[]
    ).filter((id) => !presentProducts.has(id));

    return {
      offeringId: current.identifier,
      packages,
      missingExpected,
      missingStoreProducts,
    };
  } catch (error) {
    console.warn('[revenueCat] getOfferings failed', describeError(error));
    return {
      offeringId: null,
      packages: [],
      missingExpected: Object.values(OFFERING_PACKAGE_IDS),
      missingStoreProducts: Object.values(STORE_PRODUCT_IDS),
    };
  }
}

export function paywallGrantedAccess(result: PAYWALL_RESULT): boolean {
  return (
    result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED
  );
}

export function paywallWasCancelled(result: PAYWALL_RESULT): boolean {
  return (
    result === PAYWALL_RESULT.CANCELLED ||
    result === PAYWALL_RESULT.NOT_PRESENTED
  );
}

function purchasesErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const code = (error as PurchasesError).code;
  return typeof code === 'string' ? code : undefined;
}

function describeError(error: unknown): string {
  if (!error || typeof error !== 'object') return String(error);
  const purchasesError = error as PurchasesError;
  const code = purchasesError.code ?? 'unknown';
  const message = purchasesError.message ?? 'no message';
  if (code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
    return `network: ${message}`;
  }
  return `${code}: ${message}`;
}
