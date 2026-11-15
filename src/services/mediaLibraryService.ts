import * as MediaLibrary from 'expo-media-library/legacy';
import type {
  AlbumOption,
  AlbumOptionId,
  AlbumSelectionMode,
  GalleryAsset,
} from '../types/domain';
import { useMediaReadinessStore } from '../store/mediaReadinessStore';
import { shuffleInPlace } from '../utils/random';

/** Paging size when loading more album assets in the background. */
const ALBUM_PAGE_SIZE = 200;
const ALBUM_INITIAL_FIRST = 100;
const RANDOM_PAGE_SIZE = 500;
/** Initial random payload to render quickly before background paging. */
const RANDOM_INITIAL_FIRST = 600;
/** Safety cap for progressive random loading in this session. */
const RANDOM_MAX_ASSETS = 25_000;
const APPROVED_MAX_ASSETS = 6_000;
const ALBUM_BACKGROUND_MAX_ASSETS = 8000;
const COVER_FETCH_CONCURRENCY = 6;

/** Photos and videos shown in the swipe flow (excludes audio-only). */
const GALLERY_MEDIA_TYPES: MediaLibrary.MediaTypeValue[] = [
  MediaLibrary.MediaType.photo,
  MediaLibrary.MediaType.video,
];

/** Smart / localized album titles that are easy to miss from `getAlbumsAsync` alone. */
const EXTRA_ALBUM_TITLES_TO_MERGE: readonly string[] = [
  'Videos',
  'Vídeos',
  'Video',
  'Films',
  'Movies',
  'Slo-mo',
  'Slomo',
  'Câmera lenta',
  'Time-lapse',
  'Time Lapse',
  'Panoramas',
];

const resolvedUriByAssetId = new Map<string, string>();
const resolveInflight = new Map<string, Promise<string>>();
const RESOLVED_URI_LRU_LIMIT = 2500;
const ASSET_INFO_TIMEOUT_MS = 4500;
const PREFETCH_DOWNLOAD_TIMEOUT_MS = 12000;
const PREFETCH_DOWNLOAD_AHEAD = 8;
const PREFETCH_DOWNLOAD_CONCURRENCY = 2;
const PREFETCH_DOWNLOAD_MAX_RETRIES = 2;
const PREFETCH_DOWNLOAD_RETRY_BASE_MS = 1200;

interface PrefetchQueueItem {
  readonly asset: GalleryAsset;
  readonly attempt: number;
}

const prefetchQueue: PrefetchQueueItem[] = [];
const queuedPrefetchKeys = new Set<string>();
let activePrefetchDownloads = 0;

export type MediaPermissionStatus = MediaLibrary.PermissionResponse['status'];

export interface EnsurePermissionResult {
  readonly granted: boolean;
  readonly status: MediaPermissionStatus;
  readonly canAskAgain: boolean;
}

export interface LoadSwipeSessionAssetsResult {
  readonly assets: GalleryAsset[];
  readonly continueAlbumInBackground: (() => void) | null;
}

function toGalleryAsset(asset: MediaLibrary.Asset): GalleryAsset {
  return {
    id: asset.id,
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    creationTime: asset.creationTime,
    mediaType: asset.mediaType,
  };
}

function setResolvedUriCache(assetId: string, uri: string): void {
  // Move key to end to emulate LRU recency.
  if (resolvedUriByAssetId.has(assetId)) {
    resolvedUriByAssetId.delete(assetId);
  }
  resolvedUriByAssetId.set(assetId, uri);
  if (resolvedUriByAssetId.size <= RESOLVED_URI_LRU_LIMIT) return;
  const oldestKey = resolvedUriByAssetId.keys().next().value;
  if (typeof oldestKey === 'string') {
    resolvedUriByAssetId.delete(oldestKey);
  }
}

export function clearResolvedUriCache(): void {
  resolvedUriByAssetId.clear();
  resolveInflight.clear();
  prefetchQueue.length = 0;
  queuedPrefetchKeys.clear();
  activePrefetchDownloads = 0;
}

export function peekCachedDisplayUri(assetId: string): string | undefined {
  return resolvedUriByAssetId.get(assetId);
}

export function isAssetDisplayReady(asset: Pick<GalleryAsset, 'id' | 'uri'>): boolean {
  if (!assetUriRequiresNativeResolution(asset.uri)) return true;
  const cached = peekCachedDisplayUri(asset.id);
  return !!cached && !assetUriRequiresNativeResolution(cached);
}

export function prefetchDisplayableUris(assets: readonly GalleryAsset[]): void {
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i]!;
    if (i < PREFETCH_DOWNLOAD_AHEAD) {
      enqueuePrefetchDownload(asset);
      continue;
    }
    void resolveDisplayableAssetUri(asset, {
      shouldDownloadFromNetwork: false,
      timeoutMs: ASSET_INFO_TIMEOUT_MS,
    });
  }
}

function prefetchKey(assetId: string, attempt: number): string {
  return `${assetId}:${attempt}`;
}

function enqueuePrefetchDownload(asset: GalleryAsset, attempt = 0): void {
  if (!assetUriRequiresNativeResolution(asset.uri)) return;
  if (isAssetDisplayReady(asset)) return;

  const key = prefetchKey(asset.id, attempt);
  if (queuedPrefetchKeys.has(key)) return;
  queuedPrefetchKeys.add(key);
  useMediaReadinessStore.getState().markPending(asset.id);
  prefetchQueue.push({ asset, attempt });
  processPrefetchDownloadQueue();
}

function scheduleRetryPrefetch(asset: GalleryAsset, nextAttempt: number): void {
  const delay = PREFETCH_DOWNLOAD_RETRY_BASE_MS * 2 ** Math.max(0, nextAttempt - 1);
  setTimeout(() => {
    enqueuePrefetchDownload(asset, nextAttempt);
  }, delay);
}

function processPrefetchDownloadQueue(): void {
  while (activePrefetchDownloads < PREFETCH_DOWNLOAD_CONCURRENCY && prefetchQueue.length > 0) {
    const item = prefetchQueue.shift()!;
    queuedPrefetchKeys.delete(prefetchKey(item.asset.id, item.attempt));
    activePrefetchDownloads += 1;
    useMediaReadinessStore.getState().markDownloading(item.asset.id, item.attempt + 1);
    void (async () => {
      try {
        await resolveDisplayableAssetUri(item.asset, {
          shouldDownloadFromNetwork: true,
          timeoutMs: PREFETCH_DOWNLOAD_TIMEOUT_MS,
        });
        useMediaReadinessStore.getState().markReady(item.asset.id, item.attempt + 1);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to prefetch media.';
        useMediaReadinessStore.getState().markFailed(item.asset.id, item.attempt + 1, msg);
        if (item.attempt < PREFETCH_DOWNLOAD_MAX_RETRIES) {
          scheduleRetryPrefetch(item.asset, item.attempt + 1);
        }
      } finally {
        activePrefetchDownloads = Math.max(0, activePrefetchDownloads - 1);
        processPrefetchDownloadQueue();
      }
    })();
  }
}

interface ResolveDisplayableAssetUriOptions {
  readonly shouldDownloadFromNetwork?: boolean;
  readonly timeoutMs?: number;
}

export async function ensureMediaLibraryPermission(): Promise<EnsurePermissionResult> {
  const existing = await MediaLibrary.getPermissionsAsync();
  if (existing.granted) {
    return { granted: true, status: existing.status, canAskAgain: existing.canAskAgain };
  }
  const requested = await MediaLibrary.requestPermissionsAsync();
  return {
    granted: requested.granted,
    status: requested.status,
    canAskAgain: requested.canAskAgain,
  };
}

async function tryGetAlbumByTitle(title: string): Promise<MediaLibrary.Album | null> {
  try {
    return await MediaLibrary.getAlbumAsync(title);
  } catch {
    return null;
  }
}

async function collectAlbumsIncludingVideoBuckets(): Promise<MediaLibrary.Album[]> {
  const primary = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const byId = new Map<string, MediaLibrary.Album>();
  for (const a of primary) {
    byId.set(a.id, a);
  }

  for (const title of EXTRA_ALBUM_TITLES_TO_MERGE) {
    const extra = await tryGetAlbumByTitle(title);
    if (extra && extra.assetCount > 0 && !byId.has(extra.id)) {
      byId.set(extra.id, extra);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
}

export async function fetchAlbumOptionsForPicker(): Promise<readonly AlbumOption[]> {
  const [albums, libraryPage] = await Promise.all([
    collectAlbumsIncludingVideoBuckets(),
    MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: GALLERY_MEDIA_TYPES,
      sortBy: MediaLibrary.SortBy.creationTime,
    }),
  ]);

  const mapped: AlbumOption[] = albums
    .filter((album) => album.assetCount > 0)
    .map((album) => {
    const id: AlbumOptionId = `album:${album.id}`;
    return {
      id,
      title: album.title,
      subtitle:
        album.assetCount === 1 ? '1 mídia' : `${album.assetCount} mídias`,
      assetCount: album.assetCount,
      mode: 'album',
      libraryAlbumId: album.id,
      highlightIcon: false,
      coverUri: null,
    };
    });

  // Album counts cannot be summed: the same asset may belong to multiple albums.
  // totalCount comes from one library-wide query and therefore counts each asset once.
  const totalAssets = libraryPage.totalCount;

  const randomOption: AlbumOption = {
    id: 'random',
    title: 'Aleatório',
    subtitle: totalAssets > 0 ? 'Misturar toda a galeria' : 'Sem mídias disponíveis',
    assetCount: totalAssets,
    mode: 'random',
    libraryAlbumId: null,
    highlightIcon: true,
    coverUri: null,
  };

  return totalAssets > 0 ? [randomOption, ...mapped] : [];
}

/**
 * Fills `coverUri` (most recent item in each album). Run after listing rows for faster first paint.
 */
export async function attachCoversToAlbumOptions(
  albums: readonly AlbumOption[],
): Promise<AlbumOption[]> {
  const out: AlbumOption[] = [...albums];

  const indicesNeedingCover = out
    .map((a, i) => (a.mode === 'album' && a.libraryAlbumId ? i : -1))
    .filter((i) => i >= 0);

  for (let i = 0; i < indicesNeedingCover.length; i += COVER_FETCH_CONCURRENCY) {
    const slice = indicesNeedingCover.slice(i, i + COVER_FETCH_CONCURRENCY);
    await Promise.all(
      slice.map(async (idx) => {
        const opt = out[idx]!;
        const uri = await getLatestCoverUriForAlbum(opt.libraryAlbumId!);
        out[idx] = { ...opt, coverUri: uri };
      }),
    );
  }

  return out;
}

async function getLatestCoverUriForAlbum(albumId: string): Promise<string | null> {
  const page = await MediaLibrary.getAssetsAsync({
    album: albumId,
    first: 1,
    mediaType: GALLERY_MEDIA_TYPES,
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });

  const raw = page.assets[0];
  if (!raw) return null;

  const ga = toGalleryAsset(raw);
  try {
    const u = await resolveDisplayableAssetUri(ga);
    return assetUriRequiresNativeResolution(u) ? null : u;
  } catch {
    return null;
  }
}

interface RandomInitialPageResult {
  readonly initial: GalleryAsset[];
  readonly hasNextPage: boolean;
  readonly endCursor: string | null;
}

async function loadRandomInitialBatch(): Promise<RandomInitialPageResult> {
  const page = await MediaLibrary.getAssetsAsync({
    first: RANDOM_INITIAL_FIRST,
    mediaType: GALLERY_MEDIA_TYPES,
    sortBy: MediaLibrary.SortBy.creationTime,
  });
  const initial = page.assets.map(toGalleryAsset);
  shuffleInPlace(initial);
  return {
    initial,
    hasNextPage: page.hasNextPage,
    endCursor: page.endCursor ?? null,
  };
}

function startPagingRestOfRandomGallery(
  afterCursor: string,
  alreadyLoaded: number,
  appendToQueue: (batch: readonly GalleryAsset[]) => void,
): void {
  void (async () => {
    let after: string | undefined = afterCursor;
    let loaded = alreadyLoaded;
    for (;;) {
      const page = await MediaLibrary.getAssetsAsync({
        first: RANDOM_PAGE_SIZE,
        after,
        mediaType: GALLERY_MEDIA_TYPES,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      const batch = page.assets.map(toGalleryAsset);
      if (batch.length > 0) {
        shuffleInPlace(batch);
        appendToQueue(batch);
        loaded += batch.length;
      }

      if (!page.hasNextPage) break;
      if (loaded >= RANDOM_MAX_ASSETS) break;
      after = page.endCursor;
      if (!after) break;
    }
  })();
}

function startPagingRestOfAlbum(
  albumId: string,
  afterCursor: string,
  appendToQueue: (batch: readonly GalleryAsset[]) => void,
): void {
  void (async () => {
    let after: string | undefined = afterCursor;
    let loaded = 0;

    for (;;) {
      const page = await MediaLibrary.getAssetsAsync({
        album: albumId,
        first: ALBUM_PAGE_SIZE,
        after,
        mediaType: GALLERY_MEDIA_TYPES,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const batch = page.assets.map(toGalleryAsset);
      if (batch.length > 0) {
        appendToQueue(batch);
        loaded += batch.length;
      }

      if (!page.hasNextPage) break;
      if (loaded >= ALBUM_BACKGROUND_MAX_ASSETS) break;
      after = page.endCursor;
    }
  })();
}

export interface LoadAssetsForAlbumSelectionInput {
  readonly mode: AlbumSelectionMode;
  readonly libraryAlbumId: string | null;
  readonly keptAssetIds?: readonly string[];
  readonly pendingDeleteAssetIds?: readonly string[];
}

export async function loadAssetsByIds(assetIds: readonly string[]): Promise<GalleryAsset[]> {
  if (assetIds.length === 0) return [];
  const picked = assetIds.slice(0, APPROVED_MAX_ASSETS);
  const assets: GalleryAsset[] = [];

  // Thousands of concurrent getAssetInfoAsync calls can terminate Expo Go/native.
  // Resolve small batches so virtual albums remain safe even after long-term use.
  const concurrency = 8;
  for (let i = 0; i < picked.length; i += concurrency) {
    const batch = picked.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (id) => {
        const info = await MediaLibrary.getAssetInfoAsync(id, {
          shouldDownloadFromNetwork: false,
        });
        const uri = info.localUri ?? info.uri;
        if (!uri) return null;
        return {
          id: info.id,
          uri,
          width: info.width ?? 0,
          height: info.height ?? 0,
          creationTime: info.creationTime ?? 0,
          mediaType: info.mediaType,
        } as GalleryAsset;
      }),
    );
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) {
        assets.push(result.value);
      }
    }
  }

  return assets;
}

export async function loadSwipeSessionAssets(
  input: LoadAssetsForAlbumSelectionInput,
  appendToQueue: (batch: readonly GalleryAsset[]) => void,
): Promise<LoadSwipeSessionAssetsResult> {
  if (input.mode === 'kept' || input.mode === 'pendingDelete') {
    const ids =
      input.mode === 'kept'
        ? (input.keptAssetIds ?? [])
        : (input.pendingDeleteAssetIds ?? []);
    const assets = await loadAssetsByIds(ids);
    assets.sort((a, b) => b.creationTime - a.creationTime);
    return { assets, continueAlbumInBackground: null };
  }

  if (input.mode === 'random') {
    const first = await loadRandomInitialBatch();
    const continueAlbumInBackground =
      first.hasNextPage && first.endCursor
        ? () => startPagingRestOfRandomGallery(first.endCursor!, first.initial.length, appendToQueue)
        : null;
    return { assets: first.initial, continueAlbumInBackground };
  }

  if (!input.libraryAlbumId) {
    return { assets: [], continueAlbumInBackground: null };
  }

  const first = await MediaLibrary.getAssetsAsync({
    album: input.libraryAlbumId,
    first: ALBUM_INITIAL_FIRST,
    mediaType: GALLERY_MEDIA_TYPES,
    sortBy: MediaLibrary.SortBy.creationTime,
  });

  const assets = first.assets.map(toGalleryAsset);

  const continueAlbumInBackground =
    first.hasNextPage && first.endCursor
      ? () => startPagingRestOfAlbum(input.libraryAlbumId!, first.endCursor, appendToQueue)
      : null;

  return { assets, continueAlbumInBackground };
}

export function assetUriRequiresNativeResolution(uri: string): boolean {
  return uri.startsWith('ph://') || uri.startsWith('assets-library://');
}

function makeResolveInflightKey(assetId: string, shouldDownloadFromNetwork: boolean): string {
  return shouldDownloadFromNetwork ? `${assetId}:net` : `${assetId}:local`;
}

export async function resolveDisplayableAssetUri(
  asset: GalleryAsset,
  options: ResolveDisplayableAssetUriOptions = {},
): Promise<string> {
  const shouldDownloadFromNetwork = options.shouldDownloadFromNetwork ?? false;
  const timeoutMs = options.timeoutMs ?? ASSET_INFO_TIMEOUT_MS;

  if (!assetUriRequiresNativeResolution(asset.uri)) {
    setResolvedUriCache(asset.id, asset.uri);
    useMediaReadinessStore.getState().markReady(asset.id, 0);
    return asset.uri;
  }

  const memo = resolvedUriByAssetId.get(asset.id);
  if (memo !== undefined && !assetUriRequiresNativeResolution(memo)) {
    useMediaReadinessStore.getState().markReady(asset.id, 0);
    return memo;
  }

  const inflightKey = makeResolveInflightKey(asset.id, shouldDownloadFromNetwork);
  const existing = resolveInflight.get(inflightKey);
  if (existing) {
    return existing;
  }

  const task = (async (): Promise<string> => {
    const info = await Promise.race([
      MediaLibrary.getAssetInfoAsync(asset.id, {
        // Keep swipe responsive by default; selective ahead prefetch may opt in.
        shouldDownloadFromNetwork,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timed out resolving media URI.'));
        }, timeoutMs);
      }),
    ]);

    const candidate = info.localUri ?? info.uri;
    const resolved =
      candidate && !assetUriRequiresNativeResolution(candidate)
        ? candidate
        : (candidate ?? asset.uri);

    if (!assetUriRequiresNativeResolution(resolved)) {
      setResolvedUriCache(asset.id, resolved);
      useMediaReadinessStore.getState().markReady(asset.id, 0);
    }

    return resolved;
  })();

  resolveInflight.set(inflightKey, task);

  try {
    return await task;
  } finally {
    resolveInflight.delete(inflightKey);
  }
}

export async function deleteAssetsFromLibrary(assetIds: readonly string[]): Promise<void> {
  if (assetIds.length === 0) return;
  await MediaLibrary.deleteAssetsAsync([...assetIds]);
}
