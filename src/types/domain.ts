import type { MediaTypeValue } from 'expo-media-library/legacy';

/** How the user chose to source photos for the swipe session. */
export type AlbumSelectionMode = 'random' | 'album' | 'kept' | 'pendingDelete';

/** Stable key for list rendering and navigation params. */
export type AlbumOptionId = `album:${string}` | 'random' | 'approved' | 'pending-delete';

/** One row in the album picker (including synthetic "Aleatório"). */
export interface AlbumOption {
  readonly id: AlbumOptionId;
  readonly title: string;
  readonly subtitle: string;
  readonly assetCount: number;
  readonly mode: AlbumSelectionMode;
  /** Underlying MediaLibrary album id when `mode === 'album'`. */
  readonly libraryAlbumId: string | null;
  readonly highlightIcon: boolean;
  /** Latest asset in album, resolved for Image (null while loading or if unavailable). */
  readonly coverUri: string | null;
}

/** Normalized asset for the swipe UI (decoupled from expo-media-library types). */
export interface GalleryAsset {
  readonly id: string;
  readonly uri: string;
  readonly width: number;
  readonly height: number;
  readonly creationTime: number;
  readonly mediaType: MediaTypeValue;
}

export type SwipeOutcome = 'delete' | 'keep';

/**
 * How the current session’s media source finished (or is finishing) loading.
 * Not persisted. Distinguishes natural end from technical caps and stale sessions.
 */
export type SourceLoadState =
  | 'loading'
  | 'paginationComplete'
  | 'partialByLimit'
  | 'cancelled'
  | 'failed';

/** Single undo step in the current session. */
export interface SwipeHistoryEntry {
  readonly assetId: string;
  readonly outcome: SwipeOutcome;
  readonly wasKept: boolean;
  readonly wasPendingDelete: boolean;
}

export function isGalleryVideo(asset: Pick<GalleryAsset, 'mediaType'>): boolean {
  return asset.mediaType === 'video' || asset.mediaType === 'pairedVideo';
}
