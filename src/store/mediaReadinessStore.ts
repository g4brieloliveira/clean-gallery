import { create } from 'zustand';

export type MediaReadinessStatus = 'idle' | 'pending' | 'downloading' | 'ready' | 'failed';

export interface MediaReadinessEntry {
  readonly status: MediaReadinessStatus;
  readonly attempts: number;
  readonly updatedAt: number;
  readonly lastError: string | null;
}

interface MediaReadinessState {
  byId: Record<string, MediaReadinessEntry>;
  markPending: (assetId: string) => void;
  markDownloading: (assetId: string, attempts: number) => void;
  markReady: (assetId: string, attempts: number) => void;
  markFailed: (assetId: string, attempts: number, errorMessage: string) => void;
  getEntry: (assetId: string) => MediaReadinessEntry | undefined;
  clearAll: () => void;
}

function now(): number {
  return Date.now();
}

export const useMediaReadinessStore = create<MediaReadinessState>()((set, get) => ({
  byId: {},

  markPending: (assetId) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [assetId]: {
          status: 'pending',
          attempts: state.byId[assetId]?.attempts ?? 0,
          updatedAt: now(),
          lastError: null,
        },
      },
    })),

  markDownloading: (assetId, attempts) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [assetId]: {
          status: 'downloading',
          attempts,
          updatedAt: now(),
          lastError: null,
        },
      },
    })),

  markReady: (assetId, attempts) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [assetId]: {
          status: 'ready',
          attempts,
          updatedAt: now(),
          lastError: null,
        },
      },
    })),

  markFailed: (assetId, attempts, errorMessage) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [assetId]: {
          status: 'failed',
          attempts,
          updatedAt: now(),
          lastError: errorMessage,
        },
      },
    })),

  getEntry: (assetId) => get().byId[assetId],

  clearAll: () => set({ byId: {} }),
}));
