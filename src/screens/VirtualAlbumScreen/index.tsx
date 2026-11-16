import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAssetDisplayUri } from '../../components/SwipeCard/useAssetDisplayUri';
import type { VirtualAlbumScreenProps } from '../../navigation/types';
import {
  loadAssetsByIdsPage,
  loadSwipeSessionAssets,
} from '../../services/mediaLibraryService';
import { useGalleryStore } from '../../store/galleryStore';
import { colors } from '../../theme/tokens';
import type { GalleryAsset } from '../../types/domain';
import { SkeletonTile } from './SkeletonTile';
import { VirtualAlbumPreview } from './VirtualAlbumPreview';
import {
  BackButton,
  EmptyBody,
  EmptyTitle,
  FadeTile,
  FooterLoader,
  GridGap,
  GridImage,
  Header,
  HeaderCopy,
  HeaderSubtitle,
  HeaderTitle,
  ReviewButton,
  ReviewButtonLabel,
  Screen,
  SkeletonFooter,
  SkeletonGrid,
  TileFallback,
  TilePressable,
} from './styles';

const PAGE_SIZE = 60;
const STAGGER_MS = 38;
const STAGGER_CAP = 20;

function PhotoTile({
  asset,
  size,
  enterDelay,
}: {
  readonly asset: GalleryAsset;
  readonly size: number;
  readonly enterDelay: number;
}): React.JSX.Element {
  const { displayUri, uriError } = useAssetDisplayUri({
    asset,
    isVideo: false,
  });
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!displayUri || uriError) return;
    opacity.setValue(0);
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: 240,
      delay: enterDelay,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [displayUri, enterDelay, opacity, uriError]);

  if (uriError) {
    return (
      <TileFallback $size={size}>
        <Ionicons name="image-outline" size={24} color={colors.textMuted} />
      </TileFallback>
    );
  }

  if (!displayUri) {
    return <SkeletonTile size={size} delayMs={enterDelay} />;
  }

  return (
    <FadeTile $size={size} style={{ opacity }}>
      <GridImage $size={size} source={{ uri: displayUri }} resizeMode="cover" />
    </FadeTile>
  );
}

function MediaTile({
  asset,
  size,
  index,
  onOpen,
}: {
  readonly asset: GalleryAsset;
  readonly size: number;
  readonly index: number;
  readonly onOpen: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const enterDelay = Math.min(index, STAGGER_CAP) * STAGGER_MS;

  return (
    <TilePressable
      $size={size}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={t('virtualAlbum.openPreviewA11y')}
    >
      {asset.mediaType === 'video' ? (
        <FadeInShell size={size} delayMs={enterDelay}>
          <TileFallback $size={size}>
            <Ionicons name="videocam" size={26} color={colors.brandSoft} />
          </TileFallback>
        </FadeInShell>
      ) : (
        <PhotoTile asset={asset} size={size} enterDelay={enterDelay} />
      )}
    </TilePressable>
  );
}

function FadeInShell({
  size,
  delayMs,
  children,
}: {
  readonly size: number;
  readonly delayMs: number;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: 240,
      delay: delayMs,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [delayMs, opacity]);

  return (
    <FadeTile $size={size} style={{ opacity }}>
      {children}
    </FadeTile>
  );
}

function InitialSkeleton({
  columns,
  tileSize,
}: {
  readonly columns: number;
  readonly tileSize: number;
}): React.JSX.Element {
  const count = columns * 6;
  return (
    <SkeletonGrid>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonTile
          key={`skeleton-${index}`}
          size={tileSize}
          delayMs={(index % columns) * 70}
        />
      ))}
    </SkeletonGrid>
  );
}

function MoreSkeleton({
  columns,
  tileSize,
}: {
  readonly columns: number;
  readonly tileSize: number;
}): React.JSX.Element {
  return (
    <SkeletonFooter>
      {Array.from({ length: columns }, (_, index) => (
        <SkeletonTile
          key={`more-${index}`}
          size={tileSize}
          delayMs={index * 70}
        />
      ))}
    </SkeletonFooter>
  );
}

export function VirtualAlbumScreen({
  navigation,
  route,
}: VirtualAlbumScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const { album } = route.params;
  const keptAssetIds = useGalleryStore((state) => state.keptAssetIds);
  const toDeleteIds = useGalleryStore((state) => state.toDeleteIds);
  const beginSession = useGalleryStore((state) => state.beginSession);
  const { width } = useWindowDimensions();

  const sourceIds = album.mode === 'kept' ? keptAssetIds : toDeleteIds;
  const orderedIds = useMemo(() => [...sourceIds].reverse(), [sourceIds]);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [revealBase, setRevealBase] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setAssets([]);
    setRevealBase(0);

    void loadAssetsByIdsPage(orderedIds, 0, PAGE_SIZE)
      .then((page) => {
        if (requestRef.current !== requestId) return;
        setAssets(page.assets);
        setNextOffset(page.nextOffset);
        setHasNextPage(page.hasNextPage);
        setRevealBase(0);
      })
      .finally(() => {
        if (requestRef.current === requestId) setLoading(false);
      });

    return () => {
      requestRef.current += 1;
    };
  }, [orderedIds]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasNextPage) return;
    const requestId = requestRef.current;
    setLoadingMore(true);
    try {
      const page = await loadAssetsByIdsPage(
        orderedIds,
        nextOffset,
        PAGE_SIZE,
      );
      if (requestRef.current !== requestId) return;
      let appendedFrom = 0;
      setAssets((current) => {
        appendedFrom = current.length;
        const existing = new Set(current.map((item) => item.id));
        const fresh = page.assets.filter((item) => !existing.has(item.id));
        return [...current, ...fresh];
      });
      setRevealBase(appendedFrom);
      setNextOffset(page.nextOffset);
      setHasNextPage(page.hasNextPage);
    } finally {
      if (requestRef.current === requestId) setLoadingMore(false);
    }
  }, [hasNextPage, loading, loadingMore, nextOffset, orderedIds]);

  const startCardReview = useCallback(async () => {
    if (loadingReview || sourceIds.length === 0) return;
    setLoadingReview(true);
    try {
      const result = await loadSwipeSessionAssets(
        {
          mode: album.mode,
          libraryAlbumId: null,
          keptAssetIds,
          pendingDeleteAssetIds: toDeleteIds,
        },
        (batch, sessionId) =>
          useGalleryStore.getState().appendToQueue(batch, sessionId),
        (state, sessionId) =>
          useGalleryStore.getState().setSourceLoadState(state, sessionId),
      );
      beginSession({
        album: { ...album, assetCount: sourceIds.length },
        assets: result.assets,
        sourceLoadState: result.initialSourceLoadState,
      });
      navigation.navigate('Swipe', {
        album: { ...album, assetCount: sourceIds.length },
      });
    } finally {
      setLoadingReview(false);
    }
  }, [
    album,
    beginSession,
    keptAssetIds,
    loadingReview,
    navigation,
    sourceIds.length,
    toDeleteIds,
  ]);

  const columns = width >= 430 ? 4 : 3;
  const tileSize = Math.floor((width - 32 - (columns - 1) * 3) / columns);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header>
        <BackButton
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.backToAlbums')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </BackButton>
        <HeaderCopy>
          <HeaderTitle>{album.title}</HeaderTitle>
          <HeaderSubtitle>
            {t('common.media', { count: sourceIds.length })}
          </HeaderSubtitle>
        </HeaderCopy>
        <ReviewButton
          onPress={() => void startCardReview()}
          disabled={sourceIds.length === 0 || loadingReview}
          $dimmed={sourceIds.length === 0 || loadingReview}
          accessibilityRole="button"
          accessibilityLabel={t('virtualAlbum.reviewA11y')}
        >
          {loadingReview ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={18} color={colors.textPrimary} />
              <ReviewButtonLabel>{t('virtualAlbum.review')}</ReviewButtonLabel>
            </>
          )}
        </ReviewButton>
      </Header>

      {loading ? (
        <InitialSkeleton columns={columns} tileSize={tileSize} />
      ) : assets.length === 0 ? (
        <FooterLoader>
          <EmptyTitle>{t('virtualAlbum.emptyTitle')}</EmptyTitle>
          <EmptyBody>{t('virtualAlbum.emptyBody')}</EmptyBody>
        </FooterLoader>
      ) : (
        <FlatList
          data={assets}
          key={`virtual-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MediaTile
              asset={item}
              size={tileSize}
              index={Math.max(0, index - revealBase)}
              onOpen={() => setPreviewIndex(index)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          columnWrapperStyle={{ gap: 3 }}
          ItemSeparatorComponent={GridGap}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.65}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <MoreSkeleton columns={columns} tileSize={tileSize} />
            ) : undefined
          }
        />
      )}

      <VirtualAlbumPreview
        visible={previewIndex !== null}
        assets={assets}
        initialIndex={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
        onIndexChange={(index) => {
          if (index >= assets.length - 8) {
            void loadMore();
          }
        }}
      />
    </Screen>
  );
}
