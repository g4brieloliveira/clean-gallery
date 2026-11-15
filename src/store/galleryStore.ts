import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearResolvedUriCache } from '../services/mediaLibraryService';
import { useMediaReadinessStore } from './mediaReadinessStore';
import type { AlbumOption, GalleryAsset, SwipeHistoryEntry, SwipeOutcome } from '../types/domain';

const STORAGE_KEY = 'clean-gallery:v1';

export interface SessionSelection {
  readonly album: AlbumOption;
}

interface GalleryState {
  /** Persisted: user explicitly chose to keep forever (skip in future sessions). */
  keptAssetIds: string[];
  /** Persisted: albums fully validated by user in past sessions. */
  validatedAlbumIds: string[];
  /** Persisted: user selections awaiting final removal confirmation. */
  toDeleteIds: string[];

  /** Current swipe session (not persisted). */
  sessionSelection: SessionSelection | null;
  queue: GalleryAsset[];
  currentIndex: number;
  sessionDeleteCount: number;
  sessionKeepCount: number;
  sessionFailedCount: number;
  history: SwipeHistoryEntry[];

  /** Hydration flag from persist middleware. */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  isKept: (assetId: string) => boolean;
  isAlbumValidated: (albumId: string) => boolean;
  markAlbumValidated: (albumId: string) => void;
  beginSession: (input: { album: AlbumOption; assets: readonly GalleryAsset[] }) => void;
  appendToQueue: (incoming: readonly GalleryAsset[]) => void;
  resetSession: () => void;
  applySwipe: (outcome: SwipeOutcome, assetId: string) => void;
  /** Skip an unrenderable current asset and hide it from future sessions. */
  skipCurrentAsUnrenderable: (assetId: string) => void;
  /** Move current item to end of queue to see another from the same pool (no keep/delete). */
  deferCurrentToEnd: () => void;
  undoLast: () => void;
  clearPendingDeletes: () => void;
  removeDeletedFromQueue: (deletedIds: readonly string[]) => void;
}

function uniquePush(list: string[], id: string): string[] {
  if (list.includes(id)) return list;
  return [...list, id];
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      keptAssetIds: [],
      validatedAlbumIds: [],
      sessionSelection: null,
      queue: [],
      currentIndex: 0,
      sessionDeleteCount: 0,
      sessionKeepCount: 0,
      sessionFailedCount: 0,
      toDeleteIds: [],
      history: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      isKept: (assetId) => get().keptAssetIds.includes(assetId),
      isAlbumValidated: (albumId) => get().validatedAlbumIds.includes(albumId),
      markAlbumValidated: (albumId) => {
        const state = get();
        if (state.validatedAlbumIds.includes(albumId)) return;
        set({ validatedAlbumIds: [...state.validatedAlbumIds, albumId] });
      },

      beginSession: ({ album, assets }) => {
        clearResolvedUriCache();
        useMediaReadinessStore.getState().clearAll();
        const kept = new Set(get().keptAssetIds);
        const isVirtualReview = album.mode === 'kept' || album.mode === 'pendingDelete';
        const filtered = isVirtualReview ? [...assets] : assets.filter((a) => !kept.has(a.id));
        set({
          sessionSelection: { album },
          queue: filtered,
          currentIndex: 0,
          sessionDeleteCount: 0,
          sessionKeepCount: 0,
          sessionFailedCount: 0,
          history: [],
        });
      },

      appendToQueue: (incoming) => {
        const state = get();
        const kept = new Set(state.keptAssetIds);
        const existing = new Set(state.queue.map((a) => a.id));
        const merged = incoming.filter((a) => !kept.has(a.id) && !existing.has(a.id));
        if (merged.length === 0) return;
        set({ queue: [...state.queue, ...merged] });
      },

      resetSession: () => {
        clearResolvedUriCache();
        useMediaReadinessStore.getState().clearAll();
        set({
          sessionSelection: null,
          queue: [],
          currentIndex: 0,
          sessionDeleteCount: 0,
          sessionKeepCount: 0,
          sessionFailedCount: 0,
          history: [],
        });
      },

      deferCurrentToEnd: () => {
        const state = get();
        const i = state.currentIndex;
        const q = state.queue;
        if (q.length < 2 || i >= q.length) return;
        const next = [...q];
        const [item] = next.splice(i, 1);
        if (!item) return;
        next.push(item);
        set({ queue: next });
      },

      applySwipe: (outcome, assetId) => {
        const state = get();
        const current = state.queue[state.currentIndex];
        if (!current || current.id !== assetId) return;
        const wasKept = state.keptAssetIds.includes(assetId);
        const wasPendingDelete = state.toDeleteIds.includes(assetId);

        if (outcome === 'keep') {
          set({
            keptAssetIds: uniquePush(state.keptAssetIds, assetId),
            toDeleteIds: state.toDeleteIds.filter((id) => id !== assetId),
            sessionKeepCount: state.sessionKeepCount + 1,
            currentIndex: state.currentIndex + 1,
            history: [
              ...state.history,
              { assetId, outcome: 'keep', wasKept, wasPendingDelete },
            ],
          });
          return;
        }

        set({
          toDeleteIds: uniquePush(state.toDeleteIds, assetId),
          keptAssetIds: state.keptAssetIds.filter((id) => id !== assetId),
          sessionDeleteCount: state.sessionDeleteCount + 1,
          currentIndex: state.currentIndex + 1,
          history: [
            ...state.history,
            { assetId, outcome: 'delete', wasKept, wasPendingDelete },
          ],
        });
      },

      skipCurrentAsUnrenderable: (assetId) => {
        const state = get();
        const current = state.queue[state.currentIndex];
        if (!current || current.id !== assetId) return;
        set({
          currentIndex: state.currentIndex + 1,
          sessionFailedCount: state.sessionFailedCount + 1,
        });
      },

      undoLast: () => {
        const state = get();
        const last = state.history[state.history.length - 1];
        if (!last) return;

        if (state.currentIndex === 0) return;

        const nextHistory = state.history.slice(0, -1);
        const nextIndex = state.currentIndex - 1;

        if (last.outcome === 'keep') {
          set({
            history: nextHistory,
            currentIndex: nextIndex,
            sessionKeepCount: Math.max(0, state.sessionKeepCount - 1),
            keptAssetIds: last.wasKept
              ? uniquePush(state.keptAssetIds, last.assetId)
              : state.keptAssetIds.filter((id) => id !== last.assetId),
            toDeleteIds: last.wasPendingDelete
              ? uniquePush(state.toDeleteIds, last.assetId)
              : state.toDeleteIds.filter((id) => id !== last.assetId),
          });
          return;
        }

        set({
          history: nextHistory,
          currentIndex: nextIndex,
          sessionDeleteCount: Math.max(0, state.sessionDeleteCount - 1),
          keptAssetIds: last.wasKept
            ? uniquePush(state.keptAssetIds, last.assetId)
            : state.keptAssetIds.filter((id) => id !== last.assetId),
          toDeleteIds: last.wasPendingDelete
            ? uniquePush(state.toDeleteIds, last.assetId)
            : state.toDeleteIds.filter((id) => id !== last.assetId),
        });
      },

      clearPendingDeletes: () => set({ toDeleteIds: [] }),

      removeDeletedFromQueue: (deletedIds) => {
        const idSet = new Set(deletedIds);
        const state = get();
        const nextQueue = state.queue.filter((a) => !idSet.has(a.id));
        const removedBeforeIndex = state.queue
          .slice(0, state.currentIndex)
          .filter((a) => idSet.has(a.id)).length;
        set({
          queue: nextQueue,
          currentIndex: Math.max(0, state.currentIndex - removedBeforeIndex),
          toDeleteIds: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        keptAssetIds: state.keptAssetIds,
        validatedAlbumIds: state.validatedAlbumIds,
        toDeleteIds: state.toDeleteIds,
      }),
      onRehydrateStorage: () => () => {
        useGalleryStore.getState().setHasHydrated(true);
      },
    },
  ),
);

export function selectCurrentAsset(state: GalleryState): GalleryAsset | null {
  return state.queue[state.currentIndex] ?? null;
}

export function selectRemainingCount(state: GalleryState): number {
  return Math.max(0, state.queue.length - state.currentIndex);
}
