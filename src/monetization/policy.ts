export const FREE_DAILY_REVIEWS = 100;
export const REWARDED_AD_BONUS_REVIEWS = 25;
export const MAX_REWARDED_ADS_PER_DAY = 2;

export type PremiumStatus = 'unknown' | 'inactive' | 'active';

export interface DailyReviewLedger {
  readonly dayKey: string;
  readonly reviewsUsed: number;
  readonly bonusReviewsGranted: number;
  readonly rewardedAdsCompleted: number;
}

export function localDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDailyReviewLedger(dayKey: string = localDayKey()): DailyReviewLedger {
  return {
    dayKey,
    reviewsUsed: 0,
    bonusReviewsGranted: 0,
    rewardedAdsCompleted: 0,
  };
}

export function ledgerForDay(
  ledger: DailyReviewLedger,
  dayKey: string,
): DailyReviewLedger {
  return ledger.dayKey === dayKey ? ledger : createDailyReviewLedger(dayKey);
}

export function totalReviewAllowance(ledger: DailyReviewLedger): number {
  return FREE_DAILY_REVIEWS + ledger.bonusReviewsGranted;
}

export function remainingReviews(
  ledger: DailyReviewLedger,
  premiumStatus: PremiumStatus,
): number | null {
  if (premiumStatus === 'active') return null;
  return Math.max(0, totalReviewAllowance(ledger) - ledger.reviewsUsed);
}

export function canConsumeReview(
  ledger: DailyReviewLedger,
  premiumStatus: PremiumStatus,
): boolean {
  return premiumStatus === 'active' || ledger.reviewsUsed < totalReviewAllowance(ledger);
}

export function consumeReview(
  ledger: DailyReviewLedger,
  premiumStatus: PremiumStatus,
): DailyReviewLedger | null {
  if (!canConsumeReview(ledger, premiumStatus)) return null;
  if (premiumStatus === 'active') return ledger;
  return { ...ledger, reviewsUsed: ledger.reviewsUsed + 1 };
}

export function refundReview(
  ledger: DailyReviewLedger,
  premiumStatus: PremiumStatus,
): DailyReviewLedger {
  if (premiumStatus === 'active' || ledger.reviewsUsed === 0) return ledger;
  return { ...ledger, reviewsUsed: ledger.reviewsUsed - 1 };
}

export function canCompleteRewardedAd(ledger: DailyReviewLedger): boolean {
  return ledger.rewardedAdsCompleted < MAX_REWARDED_ADS_PER_DAY;
}

export function grantRewardedAdBonus(ledger: DailyReviewLedger): DailyReviewLedger | null {
  if (!canCompleteRewardedAd(ledger)) return null;
  return {
    ...ledger,
    bonusReviewsGranted:
      ledger.bonusReviewsGranted + REWARDED_AD_BONUS_REVIEWS,
    rewardedAdsCompleted: ledger.rewardedAdsCompleted + 1,
  };
}
