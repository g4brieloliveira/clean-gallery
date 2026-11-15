import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Linking,
  Platform,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AlbumListIconName } from '../../components/AlbumListItem/types';
import { AlbumListItem } from '../../components/AlbumListItem';
import { KleenBrand } from '../../components/KleenBrand';
import {
  attachCoversToAlbumOptions,
  ensureMediaLibraryPermission,
  fetchAlbumOptionsForPicker,
  loadSwipeSessionAssets,
} from '../../services/mediaLibraryService';
import type { AlbumOption, AlbumOptionId } from '../../types/domain';
import { useGalleryStore } from '../../store/galleryStore';
import type { AlbumsScreenProps } from '../../navigation/types';
import type { AlbumsPermissionPhase } from './types';
import { colors } from '../../theme/tokens';
import {
  Centered,
  CheckingCaption,
  Chip,
  ChipText,
  ChipsRow,
  ChipsScroll,
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
  Toolbar,
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
    title: 'Aprovadas',
    subtitle: keptCount === 1 ? '1 mídia aprovada' : `${keptCount} mídias aprovadas`,
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
    title: 'Para remover',
    subtitle: pendingCount === 1 ? '1 mídia selecionada' : `${pendingCount} mídias selecionadas`,
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
            {item.assetCount} mídia{item.assetCount === 1 ? '' : 's'}
          </GridSubtitle>
        </GridMeta>
      </GridCard>
    </GridRowWrap>
  );
}

export function AlbumsScreen({ navigation }: AlbumsScreenProps): React.JSX.Element {
  type AlbumFilterMode = 'all' | 'withMedia' | 'large';
  type SortMode = 'name' | 'countDesc' | 'countAsc';
  type ViewMode = 'list' | 'grid';

  const beginSession = useGalleryStore((s) => s.beginSession);
  const keptAssetIds = useGalleryStore((s) => s.keptAssetIds);
  const toDeleteIds = useGalleryStore((s) => s.toDeleteIds);
  const validatedAlbumIds = useGalleryStore((s) => s.validatedAlbumIds);

  const [permissionPhase, setPermissionPhase] = useState<AlbumsPermissionPhase>('checking');
  const [albums, setAlbums] = useState<readonly AlbumOption[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<AlbumFilterMode>('all');
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
      const msg = e instanceof Error ? e.message : 'Falha ao carregar álbuns.';
      setErrorMessage(msg);
      setPermissionPhase('error');
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoadingAlbums(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      try {
        setPermissionPhase('checking');
        const result = await ensureMediaLibraryPermission();
        if (cancelled) return;
        if (!result.granted) {
          setPermissionPhase('denied');
          return;
        }
        await loadAlbums();
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Falha ao verificar permissões da galeria.';
        setErrorMessage(msg);
        setPermissionPhase('error');
      }
    }

    void run();
    return () => {
      cancelled = true;
      loadRequestRef.current += 1;
    };
  }, [loadAlbums]);

  const onOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const onSelectAlbum = useCallback(
    async (id: AlbumOptionId) => {
      // Virtual albums are always available (even when empty) — they are not in `albums`.
      const album =
        id === 'approved'
          ? buildApprovedAlbumOption(keptAssetIds.length)
          : id === 'pending-delete'
            ? buildPendingDeleteAlbumOption(toDeleteIds.length)
            : (albums.find((a) => a.id === id) ?? null);
      if (!album) return;

      setLoadingAssets(true);
      setErrorMessage(null);
      try {
        const { assets, continueAlbumInBackground } = await loadSwipeSessionAssets(
          {
            mode: album.mode,
            libraryAlbumId: album.libraryAlbumId,
            keptAssetIds,
            pendingDeleteAssetIds: toDeleteIds,
          },
          (batch) => useGalleryStore.getState().appendToQueue(batch),
        );
        beginSession({ album, assets });
        navigation.navigate('Swipe', { album });
        continueAlbumInBackground?.();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Não foi possível carregar as mídias.';
        setErrorMessage(msg);
      } finally {
        setLoadingAssets(false);
      }
    },
    [albums, beginSession, keptAssetIds, navigation, toDeleteIds],
  );

  const { randomOption, approvedOption, pendingDeleteOption, processedAlbums, totalAlbums } =
    useMemo(() => {
    const random = albums.find((item) => item.mode === 'random') ?? null;
    const approved = buildApprovedAlbumOption(keptAssetIds.length);
    const pendingDelete = buildPendingDeleteAlbumOption(toDeleteIds.length);
    const baseAlbums = albums.filter((item) => item.mode === 'album' && item.assetCount > 0);
    const q = query.trim().toLowerCase();

    const searched = q.length
      ? baseAlbums.filter((item) => item.title.toLowerCase().includes(q))
      : baseAlbums;

    const filtered =
      filterMode === 'large'
        ? searched.filter((item) => item.assetCount >= 100)
        : filterMode === 'withMedia'
          ? searched.filter((item) => item.assetCount > 0 && !validatedAlbumIds.includes(item.id))
          : searched;

    const sorted = [...filtered];
    if (sortMode === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
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
    filterMode,
    keptAssetIds.length,
    query,
    sortMode,
    toDeleteIds.length,
    validatedAlbumIds,
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

  if (permissionPhase === 'checking') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Centered>
          <ActivityIndicator color="#fff" />
          <CheckingCaption>Verificando permissões…</CheckingCaption>
        </Centered>
      </Screen>
    );
  }

  if (permissionPhase === 'denied') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Centered>
          <Muted>
            Precisamos de acesso às suas fotos e vídeos para funcionar. Ative nas configurações do aparelho.
          </Muted>
          <PrimaryButton onPress={onOpenSettings}>
            <PrimaryLabel>Abrir configurações</PrimaryLabel>
          </PrimaryButton>
        </Centered>
      </Screen>
    );
  }

  if (permissionPhase === 'error') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Centered>
          <Muted>{errorMessage ?? 'Erro desconhecido.'}</Muted>
          <PrimaryButton onPress={() => void loadAlbums()}>
            <PrimaryLabel>Tentar novamente</PrimaryLabel>
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
            <Title>Que tal uma limpeza rápida?</Title>
            <Subtitle>Escolha uma coleção e revise no seu ritmo.</Subtitle>
          </HeaderTextBlock>
        </HeaderRow>

        <SearchWrap>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <SearchInput
            value={queryInput}
            onChangeText={setQueryInput}
            placeholder="Buscar álbum"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {queryInput.length > 0 ? (
            <IconButton onPress={() => setQueryInput('')}>
              <Ionicons name="close" size={16} color={colors.textPrimary} />
            </IconButton>
          ) : null}
        </SearchWrap>

        <Toolbar>
          <ChipsScroll horizontal showsHorizontalScrollIndicator={false}>
            <ChipsRow>
              <Chip $active={filterMode === 'all'} onPress={() => setFilterMode('all')}>
                <ChipText $active={filterMode === 'all'}>Todos</ChipText>
              </Chip>
              <Chip $active={filterMode === 'withMedia'} onPress={() => setFilterMode('withMedia')}>
                <ChipText $active={filterMode === 'withMedia'}>Com mídias</ChipText>
              </Chip>
              <Chip $active={filterMode === 'large'} onPress={() => setFilterMode('large')}>
                <ChipText $active={filterMode === 'large'}>Grandes (100+)</ChipText>
              </Chip>
            </ChipsRow>
          </ChipsScroll>

          <ToolbarRight>
            <IconButton
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSortMenuOpen((v) => !v);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={18} color={colors.textPrimary} />
            </IconButton>
            <Segmented>
              <SegmentButton $active={viewMode === 'list'} onPress={() => switchViewMode('list')}>
                <Ionicons
                  name="list"
                  size={16}
                  color={viewMode === 'list' ? colors.textPrimary : colors.textSecondary}
                />
              </SegmentButton>
              <SegmentButton $active={viewMode === 'grid'} onPress={() => switchViewMode('grid')}>
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
                <SortOptionText $active={sortMode === 'name'}>Nome (A-Z)</SortOptionText>
              </SortOption>
              <SortOption
                $active={sortMode === 'countDesc'}
                onPress={() => {
                  setSortMode('countDesc');
                  setSortMenuOpen(false);
                }}
              >
                <SortOptionText $active={sortMode === 'countDesc'}>Mais mídias</SortOptionText>
              </SortOption>
              <SortOption
                $active={sortMode === 'countAsc'}
                onPress={() => {
                  setSortMode('countAsc');
                  setSortMenuOpen(false);
                }}
              >
                <SortOptionText $active={sortMode === 'countAsc'}>Menos mídias</SortOptionText>
              </SortOption>
            </SortMenu>
          ) : null}
        </Toolbar>

        <SummaryCard>
          <SummaryText>
            {processedAlbums.length} de {totalAlbums} álbum{totalAlbums === 1 ? '' : 'ns'}
          </SummaryText>
          <SummaryText>
            {uniqueLibraryMediaTotal.toLocaleString('pt-BR')} mídia
            {uniqueLibraryMediaTotal === 1 ? '' : 's'} na biblioteca
          </SummaryText>
        </SummaryCard>

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
                  <Muted>Nenhum álbum encontrado.</Muted>
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
          <LoadingCaption>Preparando suas fotos…</LoadingCaption>
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
