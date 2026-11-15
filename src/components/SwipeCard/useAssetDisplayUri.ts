import { useCallback, useEffect, useState } from 'react';
import {
  assetUriRequiresNativeResolution,
  peekCachedDisplayUri,
  resolveDisplayableAssetUri,
} from '../../services/mediaLibraryService';
import type { GalleryAsset } from '../../types/domain';

interface UseAssetDisplayUriParams {
  readonly asset: GalleryAsset;
  readonly isVideo: boolean;
  readonly onPhotoLoadFailed?: () => void;
}

interface UseAssetDisplayUriResult {
  readonly displayUri: string | null;
  readonly uriError: boolean;
  readonly fallbackToAssetUri: () => void;
}

function initialDisplayUri(asset: GalleryAsset): string | null {
  if (!assetUriRequiresNativeResolution(asset.uri)) return asset.uri;
  const hit = peekCachedDisplayUri(asset.id);
  if (hit !== undefined && !assetUriRequiresNativeResolution(hit)) {
    return hit;
  }
  // Wait for a stable local URI. Starting on ph:// and later swapping to file://
  // remounts expo-video mid-playback and looks like the clip "updates by itself".
  return null;
}

export function useAssetDisplayUri(params: UseAssetDisplayUriParams): UseAssetDisplayUriResult {
  const { asset, isVideo, onPhotoLoadFailed } = params;
  const [displayUri, setDisplayUri] = useState<string | null>(() => initialDisplayUri(asset));
  const [uriError, setUriError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUriError(false);

    if (!assetUriRequiresNativeResolution(asset.uri)) {
      setDisplayUri(asset.uri);
      return () => {
        cancelled = true;
      };
    }

    const cached = peekCachedDisplayUri(asset.id);
    if (cached !== undefined && !assetUriRequiresNativeResolution(cached)) {
      setDisplayUri(cached);
      return () => {
        cancelled = true;
      };
    }

    setDisplayUri(null);

    void (async () => {
      try {
        const resolved = await resolveDisplayableAssetUri(asset, {
          shouldDownloadFromNetwork: true,
          timeoutMs: 15000,
        });
        if (cancelled) return;
        if (assetUriRequiresNativeResolution(resolved)) {
          if (isVideo) {
            setDisplayUri(asset.uri);
          } else {
            setUriError(true);
            setDisplayUri(null);
            onPhotoLoadFailed?.();
          }
          return;
        }
        setDisplayUri(resolved);
      } catch {
        if (cancelled) return;
        if (isVideo) {
          setDisplayUri(asset.uri);
        } else {
          setUriError(true);
          setDisplayUri(null);
          onPhotoLoadFailed?.();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [asset, isVideo, onPhotoLoadFailed]);

  const fallbackToAssetUri = useCallback((): void => {
    setDisplayUri((current) => {
      if (current === asset.uri) return current;
      return asset.uri;
    });
    setUriError(false);
  }, [asset.uri]);

  return { displayUri, uriError, fallbackToAssetUri };
}
