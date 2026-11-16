import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, useWindowDimensions } from 'react-native';
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
import {
  BackButton,
  EmptyBody,
  EmptyTitle,
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
  Tile,
  TileFallback,
} from './styles';

const PAGE_SIZE = 60;

function PhotoTile({
  asset,
  size,
}: {
  readonly asset: GalleryAsset;
  readonly size: number;
}): React.JSX.Element {
  const { displayUri, uriError } = useAssetDisplayUri({
    asset,
    isVideo: false,
  });

  if (!displayUri || uriError) {
    return (
      <TileFallback $size={size}>
        <Ionicons name="image-outline" size={24} color={colors.textMuted} />
      </TileFallback>
    );
  }

  return <GridImage $size={size} source={{ uri: displayUri }} resizeMode="cover" />;
}

function MediaTile({
  asset,
  size,
}: {
  readonly asset: GalleryAsset;
  readonly size: number;
}): React.JSX.Element {
  return (
    <Tile $size={size}>
      {asset.mediaType === 'video' ? (
        <TileFallback $size={size}>
          <Ionicons name="videocam" size={26} color={colors.brandSoft} />
        </TileFallback>
      ) : (
        <PhotoTile asset={asset} size={size} />
      )}
    </Tile>
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
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setAssets([]);

    void loadAssetsByIdsPage(orderedIds, 0, PAGE_SIZE)
      .then((page) => {
        if (requestRef.current !== requestId) return;
        setAssets(page.assets);
        setNextOffset(page.nextOffset);
        setHasNextPage(page.hasNextPage);
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
      setAssets((current) => {
        const existing = new Set(current.map((item) => item.id));
        return [
          ...current,
          ...page.assets.filter((item) => !existing.has(item.id)),
        ];
      });
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
        <FooterLoader>
          <ActivityIndicator color={colors.brandSoft} />
        </FooterLoader>
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
          renderItem={({ item }) => <MediaTile asset={item} size={tileSize} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          columnWrapperStyle={{ gap: 3 }}
          ItemSeparatorComponent={GridGap}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.65}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <FooterLoader>
                <ActivityIndicator color={colors.brandSoft} size="small" />
              </FooterLoader>
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}
