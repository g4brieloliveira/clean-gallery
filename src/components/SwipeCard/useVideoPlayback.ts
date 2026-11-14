import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryAsset } from '../../types/domain';

interface UseVideoPlaybackParams {
  readonly asset: GalleryAsset;
  readonly isVideo: boolean;
  readonly displayUri: string | null;
  readonly previewOpen: boolean;
  readonly onRequestFallbackUri?: () => void;
  readonly onVideoLoadFailed?: () => void;
}

interface UseVideoPlaybackResult {
  readonly player: ReturnType<typeof useVideoPlayer>;
  readonly previewPlayer: ReturnType<typeof useVideoPlayer>;
  readonly videoLoadError: boolean;
}

function safePausePlayer(player: { pause: () => void }): void {
  try {
    player.pause();
  } catch {
    // Player may already be released by native side during rapid unmount/remount.
  }
}

export function useVideoPlayback(params: UseVideoPlaybackParams): UseVideoPlaybackResult {
  const { asset, isVideo, displayUri, previewOpen, onRequestFallbackUri, onVideoLoadFailed } = params;
  const [videoLoadError, setVideoLoadError] = useState(false);
  const retriedRawUriRef = useRef(false);
  const mainLoadedUriRef = useRef<string | null>(null);
  const previewLoadedUriRef = useRef<string | null>(null);
  const currentDisplayUriRef = useRef<string | null>(displayUri);

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.staysActiveInBackground = false;
  });

  const previewPlayer = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.staysActiveInBackground = false;
  });

  useEffect(() => {
    currentDisplayUriRef.current = displayUri;
  }, [displayUri]);

  useEffect(() => {
    retriedRawUriRef.current = false;
    mainLoadedUriRef.current = null;
    previewLoadedUriRef.current = null;
    setVideoLoadError(false);
  }, [asset.id]);

  const notifyVideoFailed = useCallback(() => {
    setVideoLoadError(true);
    onVideoLoadFailed?.();
  }, [onVideoLoadFailed]);

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (!isVideo || !displayUri) return;
    if (mainLoadedUriRef.current === displayUri) return;
    mainLoadedUriRef.current = displayUri;

    setVideoLoadError(false);

    void (async () => {
      try {
        await player.replaceAsync({ uri: displayUri });
        fallbackTimer = setTimeout(() => {
          if (cancelled) return;
          if (!retriedRawUriRef.current && displayUri !== asset.uri) {
            retriedRawUriRef.current = true;
            mainLoadedUriRef.current = null;
            onRequestFallbackUri?.();
            return;
          }
          notifyVideoFailed();
        }, 5000);
      } catch {
        if (cancelled) return;
        if (!retriedRawUriRef.current && displayUri !== asset.uri) {
          retriedRawUriRef.current = true;
          mainLoadedUriRef.current = null;
          onRequestFallbackUri?.();
          return;
        }
        notifyVideoFailed();
      }
    })();

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      safePausePlayer(player);
    };
  }, [asset.uri, displayUri, isVideo, notifyVideoFailed, player]);

  useEffect(() => {
    if (!isVideo) return;
    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'error') {
        if (payload.error?.message) {
          console.warn(`[SwipeCard] Video playback failed: ${payload.error.message}`);
        }
        const activeUri = currentDisplayUriRef.current;
        if (!retriedRawUriRef.current && activeUri && activeUri !== asset.uri) {
          retriedRawUriRef.current = true;
          mainLoadedUriRef.current = null;
          onRequestFallbackUri?.();
          return;
        }
        notifyVideoFailed();
      } else if (payload.status === 'readyToPlay') {
        setVideoLoadError(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [asset.uri, isVideo, notifyVideoFailed, onRequestFallbackUri, player]);

  useEffect(() => {
    let cancelled = false;
    if (!previewOpen || !isVideo || !displayUri) return;
    if (previewLoadedUriRef.current === displayUri) return;
    previewLoadedUriRef.current = displayUri;

    void (async () => {
      try {
        await previewPlayer.replaceAsync({ uri: displayUri });
      } catch {
        if (!cancelled) {
          previewLoadedUriRef.current = null;
          notifyVideoFailed();
        }
      }
    })();

    return () => {
      cancelled = true;
      safePausePlayer(previewPlayer);
    };
  }, [displayUri, isVideo, notifyVideoFailed, previewOpen, previewPlayer]);

  return { player, previewPlayer, videoLoadError };
}
