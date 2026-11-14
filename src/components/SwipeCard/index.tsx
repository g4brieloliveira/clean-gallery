import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';
import { isGalleryVideo, type SwipeOutcome } from '../../types/domain';
import type { SwipeCardProps } from './types';
import { useAssetDisplayUri } from './useAssetDisplayUri';
import { useFullscreenPreview } from './useFullscreenPreview';
import { useVideoPlayback } from './useVideoPlayback';
import {
  CardShell,
  FullscreenHintButton,
  ImageClip,
  ImageErrorText,
  ImageLoading,
  MediaTapArea,
  Overlay,
  Photo,
  PreviewBackdrop,
  PreviewCloseButton,
  PreviewModalRoot,
  PreviewPhoto,
} from './styles';

const MAX_ROTATE_DEG = 12;

export function SwipeCard(props: SwipeCardProps): React.JSX.Element {
  const { asset, cardWidth, cardHeight, swipeThreshold, onCommit, onAssetLoadFailed, disabled } = props;
  const insets = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(0)).current;
  const lastCommitted = useRef(false);
  const isVideo = isGalleryVideo(asset);
  const failureNotifiedRef = useRef(false);

  useEffect(() => {
    lastCommitted.current = false;
    translateX.setValue(0);
    failureNotifiedRef.current = false;
  }, [asset.id, translateX]);

  const notifyAssetFailed = useCallback(() => {
    if (failureNotifiedRef.current) return;
    failureNotifiedRef.current = true;
    onAssetLoadFailed?.();
  }, [onAssetLoadFailed]);

  const { displayUri, uriError, fallbackToAssetUri } = useAssetDisplayUri({
    asset,
    isVideo,
    onPhotoLoadFailed: notifyAssetFailed,
  });

  const { previewOpen, openPreview, closePreview } = useFullscreenPreview();

  const { player, previewPlayer, videoLoadError } = useVideoPlayback({
    asset,
    isVideo,
    displayUri,
    previewOpen,
    onRequestFallbackUri: fallbackToAssetUri,
    onVideoLoadFailed: notifyAssetFailed,
  });

  const rotate = translateX.interpolate({
    inputRange: [-cardWidth, 0, cardWidth],
    outputRange: [`-${MAX_ROTATE_DEG}deg`, '0deg', `${MAX_ROTATE_DEG}deg`],
    extrapolate: 'clamp',
  });

  const borderColor = translateX.interpolate({
    inputRange: [-swipeThreshold * 1.5, 0, swipeThreshold * 1.5],
    outputRange: [colors.accentRed, colors.borderNeutral, colors.accentGreen],
    extrapolate: 'clamp',
  });

  const borderWidth = translateX.interpolate({
    inputRange: [-swipeThreshold * 1.5, 0, swipeThreshold * 1.5],
    outputRange: [4, 2, 4],
    extrapolate: 'clamp',
  });

  const redOpacity = translateX.interpolate({
    inputRange: [-swipeThreshold * 1.2, 0],
    outputRange: [0.55, 0],
    extrapolate: 'clamp',
  });

  const greenOpacity = translateX.interpolate({
    inputRange: [0, swipeThreshold * 1.2],
    outputRange: [0, 0.55],
    extrapolate: 'clamp',
  });

  const runCommit = useCallback(
    (outcome: SwipeOutcome) => {
      if (lastCommitted.current) return;
      lastCommitted.current = true;
      onCommit(outcome);
    },
    [onCommit],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => {
          if (disabled) return false;
          const dx = Math.abs(g.dx);
          const startThreshold = isVideo ? 28 : 8;
          return dx > startThreshold;
        },
        onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
          translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
          if (disabled) return;
          if (g.dx > swipeThreshold) {
            Animated.timing(translateX, {
              toValue: cardWidth * 1.4,
              duration: 220,
              useNativeDriver: false,
            }).start(() => runCommit('keep'));
          } else if (g.dx < -swipeThreshold) {
            Animated.timing(translateX, {
              toValue: -cardWidth * 1.4,
              duration: 220,
              useNativeDriver: false,
            }).start(() => runCommit('delete'));
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              friction: 6,
              tension: 80,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [asset.id, cardWidth, disabled, isVideo, runCommit, swipeThreshold, translateX],
  );

  const animatedStyle = useMemo(
    () => ({
      width: cardWidth,
      height: cardHeight,
      transform: [{ translateX }, { rotate }],
      borderColor,
      borderWidth,
    }),
    [borderColor, borderWidth, cardHeight, cardWidth, rotate, translateX],
  );

  const innerW = Math.max(1, cardWidth - 6);
  const innerH = Math.max(1, cardHeight - 6);
  const handleOpenPreview = useCallback(() => {
    openPreview(displayUri);
  }, [displayUri, openPreview]);

  const openInSystemGallery = useCallback(() => {
    void Linking.openURL(asset.uri);
  }, [asset.uri]);

  return (
    <CardShell style={animatedStyle} {...panResponder.panHandlers}>
      <ImageClip>
        {displayUri ? (
          isVideo ? (
            <>
              <VideoView
                key={`${asset.id}-${displayUri}`}
                player={player}
                nativeControls
                contentFit="contain"
                style={{ width: innerW, height: innerH, alignSelf: 'center' }}
              />
              <FullscreenHintButton onPress={handleOpenPreview} accessibilityRole="button">
                <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
              </FullscreenHintButton>
              {videoLoadError && !onAssetLoadFailed ? (
                <ImageLoading>
                  <ImageErrorText>Este vídeo não abriu aqui. Toque para abrir em tela cheia.</ImageErrorText>
                </ImageLoading>
              ) : null}
            </>
          ) : (
            <MediaTapArea onPress={handleOpenPreview} accessibilityRole="button">
              <Photo source={{ uri: displayUri }} resizeMode="cover" />
            </MediaTapArea>
          )
        ) : (
          <ImageLoading>
            {uriError && !onAssetLoadFailed ? (
              <ImageErrorText>Não foi possível carregar esta mídia.</ImageErrorText>
            ) : (
              <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
          </ImageLoading>
        )}
        <Overlay
          pointerEvents="none"
          style={{
            backgroundColor: colors.accentRed,
            opacity: redOpacity,
          }}
        />
        <Overlay
          pointerEvents="none"
          style={{
            backgroundColor: colors.accentGreen,
            opacity: greenOpacity,
          }}
        />
      </ImageClip>
      <PreviewModalRoot
        animationType="fade"
        visible={previewOpen}
        transparent
        onRequestClose={closePreview}
      >
        <PreviewBackdrop>
          <PreviewCloseButton
            style={{ top: Math.max(insets.top + 8, 18) }}
            onPress={closePreview}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </PreviewCloseButton>
          {displayUri ? (
            isVideo ? (
              <VideoView
                player={previewPlayer}
                nativeControls
                contentFit="contain"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <MediaTapArea onPress={closePreview} accessibilityRole="button">
                <PreviewPhoto source={{ uri: displayUri }} resizeMode="contain" />
              </MediaTapArea>
            )
          ) : (
            <ImageLoading>
              <ActivityIndicator color={colors.textPrimary} size="large" />
            </ImageLoading>
          )}
          {isVideo && videoLoadError ? (
            <FullscreenHintButton
              style={{ bottom: 28, top: undefined, right: 20, width: 170, borderRadius: 16 }}
              onPress={openInSystemGallery}
              accessibilityRole="button"
            >
              <ImageErrorText>Abrir no app Fotos</ImageErrorText>
            </FullscreenHintButton>
          ) : null}
        </PreviewBackdrop>
      </PreviewModalRoot>
    </CardShell>
  );
}
