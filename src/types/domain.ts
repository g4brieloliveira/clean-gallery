import type { MediaTypeValue } from 'expo-media-library';

/** How the user chose to source photos for the swipe session. */
export type AlbumSelectionMode = 'random' | 'album' | 'kept';

/** Stable key for list rendering and navigation params. */
export type AlbumOptionId = `album:${string}` | 'random' | 'approved';

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

/** Single undo step in the current session. */
export interface SwipeHistoryEntry {
  readonly assetId: string;
  readonly outcome: SwipeOutcome;
}

export function isGalleryVideo(asset: Pick<GalleryAsset, 'mediaType'>): boolean {
  return asset.mediaType === 'video' || asset.mediaType === 'pairedVideo';
}
