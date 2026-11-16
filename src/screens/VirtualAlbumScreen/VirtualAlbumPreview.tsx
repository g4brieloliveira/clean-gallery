import { Ionicons } from '@expo/vector-icons';
import { VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAssetDisplayUri } from '../../components/SwipeCard/useAssetDisplayUri';
import { useVideoPlayback } from '../../components/SwipeCard/useVideoPlayback';
import { colors } from '../../theme/tokens';
import { isGalleryVideo, type GalleryAsset } from '../../types/domain';
import {
  PreviewBackdrop,
  PreviewCloseButton,
  PreviewCounter,
  PreviewModalRoot,
  PreviewPage,
  PreviewPhoto,
  PreviewStatus,
} from './styles';

interface VirtualAlbumPreviewProps {
  readonly visible: boolean;
  readonly assets: readonly GalleryAsset[];
  readonly initialIndex: number;
  readonly onClose: () => void;
  readonly onIndexChange?: (index: number) => void;
}

function PreviewMedia({
  asset,
  width,
  height,
  active,
}: {
  readonly asset: GalleryAsset;
  readonly width: number;
  readonly height: number;
  readonly active: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();
  const isVideo = isGalleryVideo(asset);
  const { displayUri, uriError, fallbackToAssetUri } = useAssetDisplayUri({
    asset,
    isVideo,
  });
  const { previewPlayer, videoLoadError } = useVideoPlayback({
    asset,
    isVideo,
    displayUri: active ? displayUri : null,
    previewOpen: active && isVideo,
    onRequestFallbackUri: fallbackToAssetUri,
  });

  if (uriError || (isVideo && videoLoadError && active)) {
    return (
      <PreviewStatus>
        <Ionicons name="alert-circle-outline" size={28} color={colors.textMuted} />
        <PreviewCounter style={{ position: 'relative', top: undefined }}>
          {isVideo ? t('mediaCard.videoError') : t('mediaCard.loadError')}
        </PreviewCounter>
      </PreviewStatus>
    );
  }

  if (!displayUri) {
    return (
      <PreviewStatus>
        <ActivityIndicator color={colors.textPrimary} size="large" />
      </PreviewStatus>
    );
  }

  if (isVideo) {
    if (!active) {
      return (
        <PreviewStatus>
          <Ionicons name="videocam" size={42} color={colors.brandSoft} />
        </PreviewStatus>
      );
    }
    return (
      <VideoView
        player={previewPlayer}
        nativeControls
        contentFit="contain"
        style={{ width, height }}
      />
    );
  }

  return (
    <PreviewPhoto
      source={{ uri: displayUri }}
      resizeMode="contain"
      style={{ width, height }}
    />
  );
}

export function VirtualAlbumPreview({
  visible,
  assets,
  initialIndex,
  onClose,
  onIndexChange,
}: VirtualAlbumPreviewProps): React.JSX.Element | null {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<GalleryAsset>>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    });
  }, [initialIndex, visible]);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null | undefined }>;
    }) => {
      const next = viewableItems[0]?.index;
      if (typeof next !== 'number') return;
      setIndex(next);
      onIndexChange?.(next);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item, index: itemIndex }: ListRenderItemInfo<GalleryAsset>) => (
      <PreviewPage style={{ width, height }}>
        <PreviewMedia
          asset={item}
          width={width}
          height={height}
          active={visible && itemIndex === index}
        />
      </PreviewPage>
    ),
    [height, index, visible, width],
  );

  const getItemLayout = useCallback(
    (_: unknown, itemIndex: number) => ({
      length: width,
      offset: width * itemIndex,
      index: itemIndex,
    }),
    [width],
  );

  if (!visible || assets.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(initialIndex, 0), assets.length - 1);

  return (
    <PreviewModalRoot
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <PreviewBackdrop>
        <PreviewCloseButton
          style={{ top: Math.max(insets.top + 8, 18) }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </PreviewCloseButton>
        <PreviewCounter
          style={{ top: Math.max(insets.top + 16, 26) }}
          pointerEvents="none"
        >
          {t('virtualAlbum.previewCounter', {
            current: index + 1,
            total: assets.length,
          })}
        </PreviewCounter>
        <FlatList
          ref={listRef}
          data={assets as GalleryAsset[]}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={safeIndex}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={renderItem}
          onScrollToIndexFailed={({ index: failedIndex }) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: failedIndex,
                animated: false,
              });
            }, 50);
          }}
        />
      </PreviewBackdrop>
    </PreviewModalRoot>
  );
}
