import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  canCompleteRewardedAd,
  canConsumeReview,
  consumeReview,
  createDailyReviewLedger,
  grantRewardedAdBonus,
  ledgerForDay,
  localDayKey,
  refundReview,
  remainingReviews,
  type DailyReviewLedger,
  type PremiumStatus,
} from '../monetization/policy';

const STORAGE_KEY = 'kleen:monetization:v1';

interface MonetizationState {
  ledger: DailyReviewLedger;
  premiumStatus: PremiumStatus;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  setPremiumStatus: (status: PremiumStatus) => void;
  refreshDay: (dayKey?: string) => void;
  consumeReview: (dayKey?: string) => boolean;
  refundReview: (dayKey?: string) => void;
  grantRewardedAdBonus: (dayKey?: string) => boolean;
  canReview: (dayKey?: string) => boolean;
  remainingReviews: (dayKey?: string) => number | null;
  canWatchRewardedAd: (dayKey?: string) => boolean;
}

function currentLedger(state: MonetizationState, dayKey?: string): DailyReviewLedger {
  return ledgerForDay(state.ledger, dayKey ?? localDayKey());
}

export const useMonetizationStore = create<MonetizationState>()(
  persist(
    (set, get) => ({
      ledger: createDailyReviewLedger(),
      premiumStatus: 'unknown',
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setPremiumStatus: (premiumStatus) => set({ premiumStatus }),

      refreshDay: (dayKey = localDayKey()) => {
        const state = get();
        const ledger = ledgerForDay(state.ledger, dayKey);
        if (ledger === state.ledger) return;
        set({ ledger });
      },

      consumeReview: (dayKey = localDayKey()) => {
        const state = get();
        const ledger = ledgerForDay(state.ledger, dayKey);
        const next = consumeReview(ledger, state.premiumStatus);
        if (!next) {
          if (ledger !== state.ledger) set({ ledger });
          return false;
        }
        if (next !== state.ledger) set({ ledger: next });
        return true;
      },

      refundReview: (dayKey = localDayKey()) => {
        const state = get();
        const ledger = ledgerForDay(state.ledger, dayKey);
        const next = refundReview(ledger, state.premiumStatus);
        if (next !== state.ledger) set({ ledger: next });
      },

      grantRewardedAdBonus: (dayKey = localDayKey()) => {
        const state = get();
        const ledger = ledgerForDay(state.ledger, dayKey);
        const next = grantRewardedAdBonus(ledger);
        if (!next) {
          if (ledger !== state.ledger) set({ ledger });
          return false;
        }
        set({ ledger: next });
        return true;
      },

      canReview: (dayKey = localDayKey()) => {
        const state = get();
        return canConsumeReview(currentLedger(state, dayKey), state.premiumStatus);
      },

      remainingReviews: (dayKey = localDayKey()) => {
        const state = get();
        return remainingReviews(currentLedger(state, dayKey), state.premiumStatus);
      },

      canWatchRewardedAd: (dayKey = localDayKey()) => {
        const state = get();
        if (state.premiumStatus === 'active') return false;
        return canCompleteRewardedAd(currentLedger(state, dayKey));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ledger: state.ledger }),
      onRehydrateStorage: () => (state, error) => {
        useMonetizationStore.getState().refreshDay();
        useMonetizationStore.getState().setHasHydrated(true);
        if (error) {
          console.warn('[monetizationStore] rehydrate failed; using defaults');
        }
        if (!state) {
          useMonetizationStore.setState({ ledger: createDailyReviewLedger() });
        }
      },
    },
  ),
);
