import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  LayoutAnimation,
  Linking,
  Platform,
  UIManager,
  useWindowDimensions,
  type AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { AlbumListIconName } from '../../components/AlbumListItem/types';
import { AlbumListItem } from '../../components/AlbumListItem';
import { BrandSplash } from '../../components/BrandSplash';
import { KleenBrand } from '../../components/KleenBrand';
import { Onboarding } from '../../components/Onboarding';
import {
  attachCoversToAlbumOptions,
  ensureMediaLibraryPermission,
  fetchAlbumOptionsForPicker,
  getMediaLibraryPermissionSnapshot,
  loadSwipeSessionAssets,
} from '../../services/mediaLibraryService';
import type { AlbumOption, AlbumOptionId } from '../../types/domain';
import { useGalleryStore } from '../../store/galleryStore';
import type { AlbumsScreenProps } from '../../navigation/types';
import type { AlbumsPermissionPhase } from './types';
import { colors } from '../../theme/tokens';
import { i18n } from '../../i18n';
import {
  Centered,
  Content,
  EmptyListCard,
  ErrorRowInset,
  GridCard,
  GridMeta,
  GridRowWrap,
  GridSubtitle,
  GridThumb,
  GridThumbFallback,
  GridTitle,
  HeaderRow,
  HeaderTextBlock,
  IconButton,
  LimitedAccessBanner,
  LimitedAccessBody,
  LimitedAccessTitle,
  ListPad,
  LoadingCaption,
  LoadingOverlay,
  Muted,
  PrimaryButton,
  PrimaryLabel,
  RandomCard,
  RandomIconBox,
  RandomSubtitle,
  RandomTextWrap,
  RandomTitle,
  Screen,
  SearchInput,
  SearchRow,
  SearchWrap,
  SegmentButton,
  Segmented,
  SortBackdrop,
  SortMenu,
  SortOption,
  SortOptionText,
  Subtitle,
  SummaryCard,
  SummaryText,
  ToolbarRight,
  Title,
  VirtualAlbumCard,
  VirtualAlbumIconBox,
  VirtualAlbumsRow,
} from './styles';

function mapAlbumToIcon(album: AlbumOption): AlbumListIconName {
  if (album.mode === 'random') return 'shuffle';
  if (album.mode === 'kept') return 'checkmark-done-outline';
  if (album.mode === 'pendingDelete') return 'close-circle-outline';
  const t = album.title.toLowerCase();
  if (t.includes('vídeo') || t.includes('video') || t.includes('film')) return 'videocam-outline';
  if (t.includes('câmera') || t.includes('camera')) return 'camera-outline';
  if (t.includes('captura') || t.includes('screenshot')) return 'phone-portrait-outline';
  if (t.includes('whatsapp')) return 'chatbubble-ellipses-outline';
  if (t.includes('download')) return 'download-outline';
  if (t.includes('selfie')) return 'person-outline';
  return 'person-outline';
}

function buildApprovedAlbumOption(keptCount: number): AlbumOption {
  return {
    id: 'approved',
    title: i18n.t('albums.approved'),
    subtitle: i18n.t('albums.approvedSubtitle', { count: keptCount }),
    assetCount: keptCount,
    mode: 'kept',
    libraryAlbumId: null,
    highlightIcon: false,
    coverUri: null,
  };
}

function buildPendingDeleteAlbumOption(pendingCount: number): AlbumOption {
  return {
    id: 'pending-delete',
    title: i18n.t('albums.pending'),
    subtitle: i18n.t('albums.pendingSubtitle', { count: pendingCount }),
    assetCount: pendingCount,
    mode: 'pendingDelete',
    libraryAlbumId: null,
    highlightIcon: false,
    coverUri: null,
  };
}

interface GridAlbumCardProps {
  readonly item: AlbumOption;
  readonly thumbHeight: number;
  readonly onPress: (id: AlbumOptionId) => void;
}

function GridAlbumCard({ item, thumbHeight, onPress }: GridAlbumCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const [thumbFailed, setThumbFailed] = useState(false);

  useEffect(() => {
    setThumbFailed(false);
  }, [item.coverUri, item.id]);

  return (
    <GridRowWrap>
      <GridCard onPress={() => onPress(item.id)}>
        {item.coverUri && !thumbFailed ? (
          <GridThumb
            $height={thumbHeight}
            source={{ uri: item.coverUri }}
            resizeMode="cover"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <GridThumbFallback $height={thumbHeight}>
            <Ionicons name={mapAlbumToIcon(item)} size={22} color="#8E8E93" />
          </GridThumbFallback>
        )}
        <GridMeta>
          <GridTitle numberOfLines={1}>{item.title}</GridTitle>
          <GridSubtitle numberOfLines={1}>
            {t('common.media', { count: item.assetCount })}
          </GridSubtitle>
        </GridMeta>
      </GridCard>
    </GridRowWrap>
  );
}

export function AlbumsScreen({ navigation }: AlbumsScreenProps): React.JSX.Element {
  const { t, i18n: activeI18n } = useTranslation();
  type SortMode = 'name' | 'countDesc' | 'countAsc';
  type ViewMode = 'list' | 'grid';

  const beginSession = useGalleryStore((s) => s.beginSession);
  const hasHydrated = useGalleryStore((s) => s.hasHydrated);
  const hasSeenOnboarding = useGalleryStore((s) => s.hasSeenOnboarding);
  const completeOnboarding = useGalleryStore((s) => s.completeOnboarding);
  const keptAssetIds = useGalleryStore((s) => s.keptAssetIds);
  const toDeleteIds = useGalleryStore((s) => s.toDeleteIds);

  const [permissionPhase, setPermissionPhase] = useState<AlbumsPermissionPhase>('checking');
  const [accessLimited, setAccessLimited] = useState(false);
  const [albums, setAlbums] = useState<readonly AlbumOption[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('countDesc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const loadRequestRef = useRef(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput);
    }, 220);
    return () => {
      clearTimeout(timer);
    };
  }, [queryInput]);

  const switchViewMode = useCallback((mode: ViewMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(mode);
  }, []);

  const loadAlbums = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoadingAlbums(true);
    setErrorMessage(null);
    try {
      const list = await fetchAlbumOptionsForPicker();
      if (loadRequestRef.current !== requestId) return;
      setAlbums(list);
      setPermissionPhase('ready');

      // Covers are best-effort and should not block first render of album list.
      void (async () => {
        try {
          const withCovers = await attachCoversToAlbumOptions([...list]);
          if (loadRequestRef.current === requestId) {
            setAlbums(withCovers);
          }
        } catch {
          // Ignore cover fetch failures to avoid locking the screen.
        }
      })();
    } catch (e) {
      if (loadRequestRef.current !== requestId) return;
      const msg = e instanceof Error ? e.message : t('albums.loadingError');
      setErrorMessage(msg);
      setPermissionPhase('error');
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoadingAlbums(false);
      }
    }
  }, [t]);

  const applyPermissionAndLoad = useCallback(
    async (mode: 'request' | 'snapshot'): Promise<void> => {
      try {
        setPermissionPhase('checking');
        const result =
          mode === 'request'
            ? await ensureMediaLibraryPermission()
            : await getMediaLibraryPermissionSnapshot();
        if (!result.granted || result.accessPrivileges === 'none') {
          setAccessLimited(false);
          setPermissionPhase('denied');
          return;
        }
        const limited = result.accessPrivileges === 'limited';
        setAccessLimited(limited);
        await loadAlbums();
        // Keep albums usable under limited access; surface a persistent banner.
        if (limited) {
          setPermissionPhase('limited');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : t('albums.permissionError');
        setErrorMessage(msg);
        setPermissionPhase('error');
      }
    },
    [loadAlbums, t],
  );

  useEffect(() => {
    if (!hasSeenOnboarding) return;
    let cancelled = false;

    async function run(): Promise<void> {
      if (cancelled) return;
      await applyPermissionAndLoad('request');
    }

    void run();
    return () => {
      cancelled = true;
      loadRequestRef.current += 1;
    };
  }, [applyPermissionAndLoad, hasSeenOnboarding]);

  useEffect(() => {
    if (!hasSeenOnboarding) return;

    const onChange = (next: AppStateStatus): void => {
      if (next !== 'active') return;
      void applyPermissionAndLoad('snapshot');
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => {
      sub.remove();
    };
  }, [applyPermissionAndLoad, hasSeenOnboarding]);

  const onOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const onSelectAlbum = useCallback(
    async (id: AlbumOptionId) => {
      if (!hasHydrated) return;
      // Virtual albums are always available (even when empty) — they are not in `albums`.
      const album =
        id === 'approved'
          ? buildApprovedAlbumOption(keptAssetIds.length)
          : id === 'pending-delete'
            ? buildPendingDeleteAlbumOption(toDeleteIds.length)
            : (albums.find((a) => a.id === id) ?? null);
      if (!album) return;

      if (album.mode === 'kept' || album.mode === 'pendingDelete') {
        navigation.navigate('VirtualAlbum', { album });
        return;
      }

      setLoadingAssets(true);
      setErrorMessage(null);
      try {
        const { assets, continueAlbumInBackground, initialSourceLoadState } =
          await loadSwipeSessionAssets(
            {
              mode: album.mode,
              libraryAlbumId: album.libraryAlbumId,
              keptAssetIds,
              pendingDeleteAssetIds: toDeleteIds,
            },
            (batch, sessionId) => useGalleryStore.getState().appendToQueue(batch, sessionId),
            (state, sessionId) => useGalleryStore.getState().setSourceLoadState(state, sessionId),
          );
        const sessionId = beginSession({
          album,
          assets,
          sourceLoadState: initialSourceLoadState,
        });
        navigation.navigate('Swipe', { album });
        continueAlbumInBackground?.(sessionId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : t('albums.mediaError');
        setErrorMessage(msg);
      } finally {
        setLoadingAssets(false);
      }
    },
    [
      albums,
      beginSession,
      hasHydrated,
      keptAssetIds,
      navigation,
      t,
      toDeleteIds,
    ],
  );

  const { randomOption, approvedOption, pendingDeleteOption, processedAlbums, totalAlbums } =
    useMemo(() => {
    const random = albums.find((item) => item.mode === 'random') ?? null;
    const approved = buildApprovedAlbumOption(keptAssetIds.length);
    const pendingDelete = buildPendingDeleteAlbumOption(toDeleteIds.length);
    const baseAlbums = albums.filter((item) => item.mode === 'album' && item.assetCount > 0);
    const q = query.trim().toLocaleLowerCase(activeI18n.language);

    const searched = q.length
      ? baseAlbums.filter((item) =>
          item.title.toLocaleLowerCase(activeI18n.language).includes(q),
        )
      : baseAlbums;

    const sorted = [...searched];
    if (sortMode === 'name') {
      sorted.sort((a, b) =>
        a.title.localeCompare(b.title, activeI18n.language, {
          sensitivity: 'base',
        }),
      );
    } else if (sortMode === 'countAsc') {
      sorted.sort((a, b) => a.assetCount - b.assetCount);
    } else {
      sorted.sort((a, b) => b.assetCount - a.assetCount);
    }

    return {
      randomOption: random,
      approvedOption: approved,
      pendingDeleteOption: pendingDelete,
      processedAlbums: sorted,
      totalAlbums: baseAlbums.length,
    };
  }, [
    albums,
    activeI18n.language,
    keptAssetIds.length,
    query,
    sortMode,
    toDeleteIds.length,
  ]);

  const uniqueLibraryMediaTotal = randomOption?.assetCount ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: AlbumOption }) => (
      <AlbumListItem
        id={item.id}
        title={item.title}
        subtitle={item.subtitle}
        icon={mapAlbumToIcon(item)}
        highlightIcon={item.highlightIcon}
        coverUri={item.coverUri}
        onPress={onSelectAlbum}
      />
    ),
    [onSelectAlbum],
  );

  const renderGridItem = useCallback(
    ({ item }: { item: AlbumOption }) => {
      const containerWidth = Math.min(520, width);
      const contentWidth = containerWidth - 48;
      const itemWidth = (contentWidth - 16) / 2;
      const thumbHeight = Math.max(112, Math.floor(itemWidth));

      return (
        <GridAlbumCard item={item} thumbHeight={thumbHeight} onPress={onSelectAlbum} />
      );
    },
    [onSelectAlbum, width],
  );

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  if (permissionPhase === 'checking') {
    return <BrandSplash caption={t('albums.checkingPermission')} />;
  }

  if (permissionPhase === 'denied') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Centered>
          <Muted accessibilityRole="text">{t('albums.deniedBody')}</Muted>
          <PrimaryButton
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel={t('albums.openSettings')}
          >
            <PrimaryLabel>{t('albums.openSettings')}</PrimaryLabel>
          </PrimaryButton>
        </Centered>
      </Screen>
    );
  }

  if (permissionPhase === 'error') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Centered>
          <Muted>{errorMessage ?? t('albums.unknownError')}</Muted>
          <PrimaryButton onPress={() => void loadAlbums()}>
            <PrimaryLabel>{t('common.retry')}</PrimaryLabel>
          </PrimaryButton>
        </Centered>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Content>
        <HeaderRow>
          <HeaderTextBlock>
            <KleenBrand compact />
            <Title>{t('albums.greeting')}</Title>
            <Subtitle>{t('albums.subtitle')}</Subtitle>
          </HeaderTextBlock>
          <IconButton
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel={t('albums.openSettingsButton')}
          >
            <Ionicons name="settings-outline" size={19} color={colors.brandSoft} />
          </IconButton>
        </HeaderRow>

        <SearchRow>
          <SearchWrap>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <SearchInput
              value={queryInput}
              onChangeText={setQueryInput}
              placeholder={t('albums.search')}
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {queryInput.length > 0 ? (
              <IconButton
                onPress={() => setQueryInput('')}
                accessibilityRole="button"
                accessibilityLabel={t('albums.clearSearch')}
              >
                <Ionicons name="close" size={16} color={colors.textPrimary} />
              </IconButton>
            ) : null}
          </SearchWrap>
          <ToolbarRight>
            <IconButton
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSortMenuOpen((v) => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('albums.sort')}
            >
              <Ionicons name="swap-vertical-outline" size={18} color={colors.textPrimary} />
            </IconButton>
            <Segmented>
              <SegmentButton
                $active={viewMode === 'list'}
                onPress={() => switchViewMode('list')}
                accessibilityRole="button"
                accessibilityLabel={t('albums.listView')}
              >
                <Ionicons
                  name="list"
                  size={16}
                  color={viewMode === 'list' ? colors.textPrimary : colors.textSecondary}
                />
              </SegmentButton>
              <SegmentButton
                $active={viewMode === 'grid'}
                onPress={() => switchViewMode('grid')}
                accessibilityRole="button"
                accessibilityLabel={t('albums.gridView')}
              >
                <Ionicons
                  name="grid"
                  size={16}
                  color={viewMode === 'grid' ? colors.textPrimary : colors.textSecondary}
                />
              </SegmentButton>
            </Segmented>
          </ToolbarRight>

          {sortMenuOpen ? <SortBackdrop onPress={() => setSortMenuOpen(false)} /> : null}
          {sortMenuOpen ? (
            <SortMenu>
              <SortOption
                $active={sortMode === 'name'}
                onPress={() => {
                  setSortMode('name');
                  setSortMenuOpen(false);
                }}
              >
                <SortOptionText $active={sortMode === 'name'}>
                  {t('albums.sortName')}
                </SortOptionText>
              </SortOption>
              <SortOption
                $active={sortMode === 'countDesc'}
                onPress={() => {
                  setSortMode('countDesc');
                  setSortMenuOpen(false);
                }}
              >
                <SortOptionText $active={sortMode === 'countDesc'}>
                  {t('albums.sortMost')}
                </SortOptionText>
              </SortOption>
              <SortOption
                $active={sortMode === 'countAsc'}
                onPress={() => {
                  setSortMode('countAsc');
                  setSortMenuOpen(false);
                }}
              >
                <SortOptionText $active={sortMode === 'countAsc'}>
                  {t('albums.sortLeast')}
                </SortOptionText>
              </SortOption>
            </SortMenu>
          ) : null}
        </SearchRow>

        <SummaryCard>
          <SummaryText>
            {t('albums.countSummary', {
              shown: processedAlbums.length,
              total: totalAlbums,
              label: t('common.album', { count: totalAlbums }).replace(
                `${totalAlbums} `,
                '',
              ),
            })}
          </SummaryText>
          <SummaryText
            accessibilityLabel={t('albums.uniqueA11y', {
              count: uniqueLibraryMediaTotal,
            })}
          >
            {t('albums.unique', {
              count: uniqueLibraryMediaTotal,
              formattedCount: uniqueLibraryMediaTotal.toLocaleString(
                activeI18n.language,
              ),
            })}
          </SummaryText>
        </SummaryCard>

        {accessLimited || permissionPhase === 'limited' ? (
          <LimitedAccessBanner
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel={t('albums.limitedA11y')}
          >
            <LimitedAccessTitle>{t('albums.limitedTitle')}</LimitedAccessTitle>
            <LimitedAccessBody>{t('albums.limitedBody')}</LimitedAccessBody>
          </LimitedAccessBanner>
        ) : null}

        <ListPad>
          {loadingAlbums ? (
            <Centered>
              <ActivityIndicator color="#fff" />
            </Centered>
          ) : (
            <>
              <VirtualAlbumsRow>
                <VirtualAlbumCard onPress={() => onSelectAlbum(approvedOption.id)}>
                  <VirtualAlbumIconBox>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={22}
                      color={colors.keep}
                    />
                  </VirtualAlbumIconBox>
                  <RandomTextWrap>
                    <RandomTitle>{approvedOption.title}</RandomTitle>
                    <RandomSubtitle>{approvedOption.subtitle}</RandomSubtitle>
                  </RandomTextWrap>
                </VirtualAlbumCard>
                <VirtualAlbumCard onPress={() => onSelectAlbum(pendingDeleteOption.id)}>
                  <VirtualAlbumIconBox>
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color={colors.remove}
                    />
                  </VirtualAlbumIconBox>
                  <RandomTextWrap>
                    <RandomTitle>{pendingDeleteOption.title}</RandomTitle>
                    <RandomSubtitle>{pendingDeleteOption.subtitle}</RandomSubtitle>
                  </RandomTextWrap>
                </VirtualAlbumCard>
              </VirtualAlbumsRow>
              {processedAlbums.length === 0 && !randomOption ? (
                <EmptyListCard>
                  <Muted>{t('albums.noneFound')}</Muted>
                </EmptyListCard>
              ) : (
                <>
                  {randomOption ? (
                    <RandomCard onPress={() => onSelectAlbum(randomOption.id)}>
                      <RandomIconBox>
                        <Ionicons name="shuffle" size={24} color={colors.textPrimary} />
                      </RandomIconBox>
                      <RandomTextWrap>
                        <RandomTitle>{randomOption.title}</RandomTitle>
                        <RandomSubtitle>{randomOption.subtitle}</RandomSubtitle>
                      </RandomTextWrap>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </RandomCard>
                  ) : null}
                  <FlatList
                    key={viewMode}
                    data={processedAlbums}
                    keyExtractor={(item) => item.id}
                    renderItem={viewMode === 'grid' ? renderGridItem : renderItem}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                  />
                </>
              )}
            </>
          )}
        </ListPad>
      </Content>
      {loadingAssets ? (
        <LoadingOverlay>
          <KleenBrand />
          <ActivityIndicator color={colors.brandSoft} size="small" />
          <LoadingCaption>{t('albums.loadingMedia')}</LoadingCaption>
        </LoadingOverlay>
      ) : null}
      {errorMessage && !loadingAssets ? (
        <ErrorRowInset>
          <Muted>{errorMessage}</Muted>
        </ErrorRowInset>
      ) : null}
    </Screen>
  );
}
