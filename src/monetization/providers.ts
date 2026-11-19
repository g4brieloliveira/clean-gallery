import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { AdMobRewardedAdProvider } from './admobRewarded';
import { isRevenueCatNativeUiAvailable } from './environment';
import type { PremiumStatus } from './policy';
import {
  configureRevenueCat,
  fetchPremiumStatus,
  paywallGrantedAccess,
  paywallWasCancelled,
  presentKleenCustomerCenter,
  presentKleenPaywall,
  restorePremiumPurchases,
} from './revenueCat';

export type RewardedAdResult = 'completed' | 'cancelled' | 'unavailable' | 'failed';

export interface RewardedAdProvider {
  readonly mode: 'fake' | 'native';
  show(): Promise<RewardedAdResult>;
}

export type PremiumPurchaseResult =
  | 'active'
  | 'cancelled'
  | 'unavailable'
  | 'failed'
  /** Offerings/products misconfigured in ASC/RevenueCat (Error 23). */
  | 'configuration'
  /** Native paywall cannot run (Expo Go) — UI should show in-app fallback. */
  | 'fallback';

export type PremiumRestoreResult =
  | 'active'
  | 'inactive'
  | 'unavailable'
  | 'failed';

export interface PremiumProvider {
  readonly mode: 'fake' | 'native';
  /** True when RevenueCat native paywall UI can be presented. */
  canPresentNativePaywall(): boolean;
  /** Configure SDK once (no-op for fake). */
  configure(): Promise<void>;
  getStatus(): Promise<PremiumStatus>;
  /** Presents RevenueCat Paywall when native UI is available. */
  purchase(): Promise<PremiumPurchaseResult>;
  /**
   * Local-only Premium unlock for Expo Go / Preview API testing.
   * Does not charge and does not talk to the store.
   */
  activatePreviewPremium(): Promise<'active'>;
  restore(): Promise<PremiumRestoreResult>;
  /** Opens Customer Center when supported. */
  presentCustomerCenter(options?: {
    readonly onStatus?: (status: PremiumStatus) => void;
  }): Promise<'opened' | 'unavailable' | 'failed'>;
}

export interface RewardedBonusResult {
  readonly adResult: RewardedAdResult;
  readonly granted: boolean;
}

/**
 * Single orchestration point that enforces the invariant: no completed
 * callback, no review credit.
 */
export async function requestRewardedReviewBonus(
  provider: RewardedAdProvider,
  grantBonus: () => boolean,
): Promise<RewardedBonusResult> {
  const adResult = await provider.show();
  if (adResult !== 'completed') {
    return { adResult, granted: false };
  }
  return { adResult, granted: grantBonus() };
}

/** Expo Go / web fallback — never credits a real ad network. */
class FakeRewardedAdProvider implements RewardedAdProvider {
  readonly mode = 'fake' as const;

  async show(): Promise<RewardedAdResult> {
    await new Promise<void>((resolve) => setTimeout(resolve, 650));
    return 'completed';
  }
}

function isAdMobNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  // Expo Go has no AdMob native binary; development/TestFlight builds do.
  return Constants.appOwnership !== 'expo';
}

function isConfigurationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string | number }).code;
  const message = String((error as { message?: string }).message ?? '');
  return (
    code === 23 ||
    code === '23' ||
    code === 'CONFIGURATION_ERROR' ||
    /configuration|offerings? empty|none of the products/i.test(message)
  );
}

function createRewardedAdProvider(): RewardedAdProvider {
  if (isAdMobNativeAvailable()) {
    return new AdMobRewardedAdProvider();
  }
  return new FakeRewardedAdProvider();
}

/**
 * RevenueCat-backed Premium. Native paywalls need a development build.
 * Expo Go falls back to an in-app preview modal.
 */
class RevenueCatPremiumProvider implements PremiumProvider {
  readonly mode = 'native' as const;

  canPresentNativePaywall(): boolean {
    return isRevenueCatNativeUiAvailable();
  }

  async configure(): Promise<void> {
    await configureRevenueCat();
  }

  async getStatus(): Promise<PremiumStatus> {
    await this.configure();
    return fetchPremiumStatus();
  }

  async purchase(): Promise<PremiumPurchaseResult> {
    try {
      await this.configure();
      if (!this.canPresentNativePaywall()) {
        return 'fallback';
      }
      const { result, status, reason } = await presentKleenPaywall();
      if (reason === 'preview_api') {
        return 'fallback';
      }
      if (reason === 'offerings_empty') {
        return 'configuration';
      }
      if (status === 'active' || paywallGrantedAccess(result)) {
        return 'active';
      }
      if (result === PAYWALL_RESULT.ERROR) {
        return 'configuration';
      }
      if (
        paywallWasCancelled(result) ||
        status === 'inactive' ||
        status === 'unknown'
      ) {
        return 'cancelled';
      }
      return 'failed';
    } catch (error) {
      console.warn('[premiumProvider] purchase/paywall failed', error);
      return isConfigurationError(error) ? 'configuration' : 'failed';
    }
  }

  async activatePreviewPremium(): Promise<'active'> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    return 'active';
  }

  async restore(): Promise<PremiumRestoreResult> {
    try {
      await this.configure();
      const { status, errorCode } = await restorePremiumPurchases();
      if (status === 'active') return 'active';
      if (status === 'inactive') return 'inactive';
      if (errorCode) return 'failed';
      return 'failed';
    } catch (error) {
      console.warn('[premiumProvider] restore failed', error);
      return 'failed';
    }
  }

  async presentCustomerCenter(options?: {
    readonly onStatus?: (status: PremiumStatus) => void;
  }): Promise<'opened' | 'unavailable' | 'failed'> {
    try {
      await this.configure();
      return await presentKleenCustomerCenter(options);
    } catch (error) {
      console.warn('[premiumProvider] customer center failed', error);
      return 'failed';
    }
  }
}

export const rewardedAdProvider: RewardedAdProvider =
  createRewardedAdProvider();
export const premiumProvider: PremiumProvider = new RevenueCatPremiumProvider();
