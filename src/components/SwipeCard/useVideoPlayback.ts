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
    const readyRef = { current: false };
    if (!isVideo || !displayUri) return;
    if (mainLoadedUriRef.current === displayUri) return;
    mainLoadedUriRef.current = displayUri;

    setVideoLoadError(false);

    const clearFallbackTimer = (): void => {
      if (!fallbackTimer) return;
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    };

    // Start the watchdog before replaceAsync so a fast readyToPlay can cancel it.
    fallbackTimer = setTimeout(() => {
      if (cancelled || readyRef.current) return;
      if (!retriedRawUriRef.current && displayUri !== asset.uri) {
        retriedRawUriRef.current = true;
        mainLoadedUriRef.current = null;
        onRequestFallbackUri?.();
        return;
      }
      notifyVideoFailed();
    }, 8000);

    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        readyRef.current = true;
        clearFallbackTimer();
        setVideoLoadError(false);
        return;
      }
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
      }
    });

    void (async () => {
      try {
        await player.replaceAsync({ uri: displayUri });
        if (cancelled || readyRef.current) {
          clearFallbackTimer();
        }
      } catch {
        if (cancelled) return;
        clearFallbackTimer();
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
      clearFallbackTimer();
      sub.remove();
      safePausePlayer(player);
    };
  }, [asset.uri, displayUri, isVideo, notifyVideoFailed, onRequestFallbackUri, player]);

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
