import {
  FREE_DAILY_REVIEWS,
  REWARDED_AD_BONUS_REVIEWS,
  createDailyReviewLedger,
} from '../../monetization/policy';
import { useMonetizationStore } from '../monetizationStore';

function resetStore(): void {
  useMonetizationStore.setState({
    ledger: createDailyReviewLedger('2026-11-15'),
    premiumStatus: 'inactive',
    hasHydrated: true,
  });
}

describe('monetizationStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('persists usage semantics across a simulated restart', () => {
    const day = '2026-11-15';
    expect(useMonetizationStore.getState().consumeReview(day)).toBe(true);
    const persistedLedger = useMonetizationStore.getState().ledger;

    useMonetizationStore.setState({
      ledger: persistedLedger,
      premiumStatus: 'unknown',
      hasHydrated: false,
    });
    useMonetizationStore.getState().setPremiumStatus('inactive');

    expect(useMonetizationStore.getState().ledger.reviewsUsed).toBe(1);
    expect(useMonetizationStore.getState().remainingReviews(day)).toBe(
      FREE_DAILY_REVIEWS - 1,
    );
  });

  it('adds bonus reviews and refunds undo', () => {
    useMonetizationStore.setState({
      ledger: {
        ...createDailyReviewLedger('2026-11-15'),
        reviewsUsed: FREE_DAILY_REVIEWS,
      },
    });
    expect(useMonetizationStore.getState().canReview('2026-11-15')).toBe(false);
    expect(
      useMonetizationStore.getState().grantRewardedAdBonus('2026-11-15'),
    ).toBe(true);
    expect(useMonetizationStore.getState().remainingReviews('2026-11-15')).toBe(
      REWARDED_AD_BONUS_REVIEWS,
    );

    expect(useMonetizationStore.getState().consumeReview('2026-11-15')).toBe(true);
    useMonetizationStore.getState().refundReview('2026-11-15');
    expect(useMonetizationStore.getState().remainingReviews('2026-11-15')).toBe(
      REWARDED_AD_BONUS_REVIEWS,
    );
  });

  it('resets usage and ad credits at the day boundary', () => {
    useMonetizationStore.setState({
      ledger: {
        ...createDailyReviewLedger('2026-11-15'),
        reviewsUsed: 80,
        bonusReviewsGranted: REWARDED_AD_BONUS_REVIEWS,
        rewardedAdsCompleted: 1,
      },
    });
    useMonetizationStore.getState().refreshDay('2026-11-16');
    expect(useMonetizationStore.getState().ledger).toEqual(
      createDailyReviewLedger('2026-11-16'),
    );
  });

  it('Premium bypasses the gate and hides rewarded ads', () => {
    useMonetizationStore.setState({
      ledger: {
        ...createDailyReviewLedger('2026-11-15'),
        reviewsUsed: FREE_DAILY_REVIEWS,
      },
      premiumStatus: 'active',
    });
    expect(useMonetizationStore.getState().canReview('2026-11-15')).toBe(true);
    expect(useMonetizationStore.getState().remainingReviews('2026-11-15')).toBeNull();
    expect(
      useMonetizationStore.getState().canWatchRewardedAd('2026-11-15'),
    ).toBe(false);
  });
});
