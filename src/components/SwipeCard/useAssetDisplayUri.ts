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

function initialDisplayUri(asset: GalleryAsset, isVideo: boolean): string | null {
  if (!assetUriRequiresNativeResolution(asset.uri)) return asset.uri;
  if (isVideo) return asset.uri;
  const hit = peekCachedDisplayUri(asset.id);
  if (hit !== undefined && !assetUriRequiresNativeResolution(hit)) {
    return hit;
  }
  return null;
}

export function useAssetDisplayUri(params: UseAssetDisplayUriParams): UseAssetDisplayUriResult {
  const { asset, isVideo, onPhotoLoadFailed } = params;
  const [displayUri, setDisplayUri] = useState<string | null>(() => initialDisplayUri(asset, isVideo));
  const [uriError, setUriError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!assetUriRequiresNativeResolution(asset.uri)) {
      setDisplayUri(asset.uri);
      setUriError(false);
      return () => {
        cancelled = true;
      };
    }

    const cached = peekCachedDisplayUri(asset.id);
    if (cached !== undefined && !assetUriRequiresNativeResolution(cached)) {
      setDisplayUri(cached);
      setUriError(false);
      return () => {
        cancelled = true;
      };
    }

    setDisplayUri(isVideo ? asset.uri : null);
    setUriError(false);

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
    setDisplayUri(asset.uri);
    setUriError(false);
  }, [asset.uri]);

  return { displayUri, uriError, fallbackToAssetUri };
}
