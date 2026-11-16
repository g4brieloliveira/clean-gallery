import {
  FREE_DAILY_REVIEWS,
  MAX_REWARDED_ADS_PER_DAY,
  REWARDED_AD_BONUS_REVIEWS,
  canConsumeReview,
  consumeReview,
  createDailyReviewLedger,
  grantRewardedAdBonus,
  ledgerForDay,
  refundReview,
  remainingReviews,
} from '../policy';

describe('monetization policy', () => {
  it('enforces the daily free limit and resets on a new local day', () => {
    let ledger = createDailyReviewLedger('2026-11-15');
    for (let i = 0; i < FREE_DAILY_REVIEWS; i += 1) {
      const next = consumeReview(ledger, 'inactive');
      expect(next).not.toBeNull();
      ledger = next!;
    }

    expect(canConsumeReview(ledger, 'inactive')).toBe(false);
    expect(consumeReview(ledger, 'inactive')).toBeNull();
    expect(remainingReviews(ledger, 'inactive')).toBe(0);

    const nextDay = ledgerForDay(ledger, '2026-11-16');
    expect(nextDay.reviewsUsed).toBe(0);
    expect(remainingReviews(nextDay, 'inactive')).toBe(FREE_DAILY_REVIEWS);
  });

  it('grants a finite rewarded-ad bonus and applies the daily ad cap', () => {
    let ledger = {
      ...createDailyReviewLedger('2026-11-15'),
      reviewsUsed: FREE_DAILY_REVIEWS,
    };

    for (let i = 0; i < MAX_REWARDED_ADS_PER_DAY; i += 1) {
      const next = grantRewardedAdBonus(ledger);
      expect(next).not.toBeNull();
      ledger = next!;
    }

    expect(ledger.bonusReviewsGranted).toBe(
      REWARDED_AD_BONUS_REVIEWS * MAX_REWARDED_ADS_PER_DAY,
    );
    expect(grantRewardedAdBonus(ledger)).toBeNull();
    expect(remainingReviews(ledger, 'inactive')).toBe(
      REWARDED_AD_BONUS_REVIEWS * MAX_REWARDED_ADS_PER_DAY,
    );
  });

  it('refunds an undone free review without going below zero', () => {
    const ledger = {
      ...createDailyReviewLedger('2026-11-15'),
      reviewsUsed: 1,
    };
    expect(refundReview(ledger, 'inactive').reviewsUsed).toBe(0);
    expect(
      refundReview(createDailyReviewLedger('2026-11-15'), 'inactive').reviewsUsed,
    ).toBe(0);
  });

  it('lets Premium bypass the limit without mutating the free ledger', () => {
    const ledger = {
      ...createDailyReviewLedger('2026-11-15'),
      reviewsUsed: FREE_DAILY_REVIEWS,
    };
    expect(canConsumeReview(ledger, 'active')).toBe(true);
    expect(consumeReview(ledger, 'active')).toBe(ledger);
    expect(remainingReviews(ledger, 'active')).toBeNull();
  });
});
