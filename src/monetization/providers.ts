import type { PremiumStatus } from './policy';

export type RewardedAdResult = 'completed' | 'cancelled' | 'unavailable' | 'failed';

export interface RewardedAdProvider {
  readonly mode: 'fake' | 'native';
  show(): Promise<RewardedAdResult>;
}

export interface PremiumProvider {
  readonly mode: 'fake' | 'native';
  getStatus(): Promise<PremiumStatus>;
  purchase(): Promise<'active' | 'cancelled' | 'unavailable' | 'failed'>;
  restore(): Promise<'active' | 'inactive' | 'unavailable' | 'failed'>;
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

/**
 * Pre-Apple implementation. It exercises the full reward flow without a native
 * ads SDK. Replace this exported adapter after the native build is available.
 */
class FakeRewardedAdProvider implements RewardedAdProvider {
  readonly mode = 'fake' as const;

  async show(): Promise<RewardedAdResult> {
    await new Promise<void>((resolve) => setTimeout(resolve, 650));
    return 'completed';
  }
}

/**
 * Purchases remain unavailable until App Store Connect + RevenueCat exist.
 * The store can still be set to `active` in unit tests to prove Pro bypasses
 * every free-limit/ad gate.
 */
class FakePremiumProvider implements PremiumProvider {
  readonly mode = 'fake' as const;

  async getStatus(): Promise<PremiumStatus> {
    return 'inactive';
  }

  async purchase(): Promise<'unavailable'> {
    return 'unavailable';
  }

  async restore(): Promise<'unavailable'> {
    return 'unavailable';
  }
}

export const rewardedAdProvider: RewardedAdProvider = new FakeRewardedAdProvider();
export const premiumProvider: PremiumProvider = new FakePremiumProvider();
