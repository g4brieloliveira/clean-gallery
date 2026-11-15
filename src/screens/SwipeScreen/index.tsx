import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { SwipeCard } from '../../components/SwipeCard';
import type { SwipeScreenProps } from '../../navigation/types';
import {
  deleteAssetsFromLibrary,
  ensureMediaLibraryPermission,
  prefetchDisplayableUris,
} from '../../services/mediaLibraryService';
import {
  selectCurrentAsset,
  selectRemainingCount,
  useGalleryStore,
} from '../../store/galleryStore';
import type { SwipeOutcome } from '../../types/domain';
import { colors } from '../../theme/tokens';
import {
  AlbumPickerChevron,
  AlbumPickerRow,
  AlbumPickerText,
  CardArea,
  DangerCta,
  DangerCtaLabel,
  DeferButton,
  EmptyBody,
  EmptyTitle,
  ErrorBanner,
  HeaderActions,
  NeutralCta,
  NeutralCtaLabel,
  PendingStrip,
  PendingStripLabel,
  Screen,
  ScreenTitle,
  TitleBlock,
  TopRow,
  UndoButton,
} from './styles';

export function SwipeScreen({ navigation, route }: SwipeScreenProps): React.JSX.Element {
  const { album } = route.params;

  const queue = useGalleryStore((s) => s.queue);
  const currentIndex = useGalleryStore((s) => s.currentIndex);
  const sessionDeleteCount = useGalleryStore((s) => s.sessionDeleteCount);
  const sessionKeepCount = useGalleryStore((s) => s.sessionKeepCount);
  const toDeleteIds = useGalleryStore((s) => s.toDeleteIds);
  const history = useGalleryStore((s) => s.history);

  const applySwipe = useGalleryStore((s) => s.applySwipe);
  const skipCurrentAsUnrenderable = useGalleryStore((s) => s.skipCurrentAsUnrenderable);
  const markAlbumValidated = useGalleryStore((s) => s.markAlbumValidated);
  const undoLast = useGalleryStore((s) => s.undoLast);
  const deferCurrentToEnd = useGalleryStore((s) => s.deferCurrentToEnd);
  const removeDeletedFromQueue = useGalleryStore((s) => s.removeDeletedFromQueue);

  const currentAsset = useGalleryStore(selectCurrentAsset);
  const remaining = useGalleryStore(selectRemainingCount);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { width, height } = Dimensions.get('window');
  const layout = useMemo(() => {
    const cardWidth = width - 40;
    const cardHeight = Math.min(height * 0.62, cardWidth * 1.35);
    const swipeThreshold = width * 0.32;
    return { cardWidth, cardHeight, swipeThreshold };
  }, [height, width]);

  const sessionFinished = queue.length > 0 && currentIndex >= queue.length;
  const canUndo = history.length > 0 && !sessionFinished;
  const canDefer =
    !sessionFinished &&
    !!currentAsset &&
    queue.length >= 2 &&
    currentIndex < queue.length - 1;

  useEffect(() => {
    if (sessionFinished && toDeleteIds.length > 0) {
      setModalOpen(true);
    }
  }, [sessionFinished, toDeleteIds.length]);

  useEffect(() => {
    if (!sessionFinished) return;
    if (album.mode !== 'album') return;
    markAlbumValidated(album.id);
  }, [album.id, album.mode, markAlbumValidated, sessionFinished]);

  useEffect(() => {
    if (queue.length === 0) return;
    const ahead = queue.slice(currentIndex, currentIndex + 12);
    prefetchDisplayableUris(ahead);
  }, [queue, currentIndex]);

  const openAlbums = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const onCommit = useCallback(
    (outcome: SwipeOutcome) => {
      if (!currentAsset) return;
      applySwipe(outcome, currentAsset.id);
    },
    [applySwipe, currentAsset],
  );

  const onBarDelete = useCallback(() => {
    if (!currentAsset) return;
    applySwipe('delete', currentAsset.id);
  }, [applySwipe, currentAsset]);

  const onBarKeep = useCallback(() => {
    if (!currentAsset) return;
    applySwipe('keep', currentAsset.id);
  }, [applySwipe, currentAsset]);

  const onAssetLoadFailed = useCallback(() => {
    if (!currentAsset) return;
    skipCurrentAsUnrenderable(currentAsset.id);
  }, [currentAsset, skipCurrentAsUnrenderable]);

  const onConfirmDelete = useCallback(async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const perm = await ensureMediaLibraryPermission();
      if (!perm.granted) {
        setDeleteError('Permissão necessária para apagar mídias.');
        setDeleteLoading(false);
        return;
      }
      const ids = [...toDeleteIds];
      await deleteAssetsFromLibrary(ids);
      removeDeletedFromQueue(ids);
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao apagar.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }, [removeDeletedFromQueue, toDeleteIds]);

  const emptyQueueOnArrival = queue.length === 0;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <TopRow>
        <TitleBlock>
          <ScreenTitle>Revisar</ScreenTitle>
          <AlbumPickerRow onPress={openAlbums}>
            <Ionicons name="images-outline" size={18} color={colors.textSecondary} />
            <AlbumPickerText>
              {album.title} · {remaining} restante{remaining === 1 ? '' : 's'}{' '}
              <AlbumPickerChevron>›</AlbumPickerChevron>
            </AlbumPickerText>
          </AlbumPickerRow>
        </TitleBlock>
        <HeaderActions>
          <DeferButton
            onPress={() => deferCurrentToEnd()}
            disabled={!canDefer}
            $dimmed={!canDefer}
            accessibilityRole="button"
            accessibilityLabel="Ver outra mídia deste álbum"
          >
            <Ionicons name="shuffle-outline" size={22} color={colors.textSecondary} />
          </DeferButton>
          <UndoButton
            onPress={() => undoLast()}
            disabled={!canUndo}
            $dimmed={!canUndo}
            accessibilityRole="button"
            accessibilityLabel="Desfazer última ação"
          >
            <Ionicons name="arrow-undo" size={22} color={colors.textSecondary} />
          </UndoButton>
        </HeaderActions>
      </TopRow>

      {emptyQueueOnArrival ? (
        <CardArea>
          <EmptyTitle>Nada para limpar aqui</EmptyTitle>
          <EmptyBody>
            Não há mídias neste álbum ou todas já foram marcadas como “manter” anteriormente.
          </EmptyBody>
          <NeutralCta onPress={openAlbums}>
            <NeutralCtaLabel>Escolher outro álbum</NeutralCtaLabel>
          </NeutralCta>
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && currentAsset ? (
        <CardArea>
          <SwipeCard
            key={currentAsset.id}
            asset={currentAsset}
            cardWidth={layout.cardWidth}
            cardHeight={layout.cardHeight}
            swipeThreshold={layout.swipeThreshold}
            onCommit={onCommit}
            onAssetLoadFailed={onAssetLoadFailed}
            disabled={false}
          />
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && sessionFinished ? (
        <CardArea>
          <EmptyTitle>Tudo pronto</EmptyTitle>
          <EmptyBody>
            {sessionDeleteCount + sessionKeepCount} revisada
            {sessionDeleteCount + sessionKeepCount === 1 ? '' : 's'} · {sessionKeepCount} mantida
            {sessionKeepCount === 1 ? '' : 's'} · {toDeleteIds.length} pronta
            {toDeleteIds.length === 1 ? '' : 's'} para remover.
          </EmptyBody>
          {toDeleteIds.length > 0 ? (
            <DangerCta onPress={() => setModalOpen(true)}>
              <DangerCtaLabel>Revisar e remover {toDeleteIds.length}</DangerCtaLabel>
            </DangerCta>
          ) : (
            <NeutralCta onPress={openAlbums}>
              <NeutralCtaLabel>Voltar aos álbuns</NeutralCtaLabel>
            </NeutralCta>
          )}
        </CardArea>
      ) : null}

      {toDeleteIds.length > 0 && currentAsset && !sessionFinished ? (
        <PendingStrip onPress={() => setModalOpen(true)}>
          <PendingStripLabel>
            {toDeleteIds.length} pronta{toDeleteIds.length === 1 ? '' : 's'} para remover · Revisar
          </PendingStripLabel>
        </PendingStrip>
      ) : null}

      {!emptyQueueOnArrival && !sessionFinished ? (
        <BottomActionBar
          deleteCount={sessionDeleteCount}
          keepCount={sessionKeepCount}
          remaining={remaining}
          onDeletePress={onBarDelete}
          onKeepPress={onBarKeep}
          disabled={!currentAsset}
        />
      ) : null}

      <DeleteConfirmModal
        visible={modalOpen}
        pendingDeleteCount={toDeleteIds.length}
        loading={deleteLoading}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => void onConfirmDelete()}
      />

      {deleteError ? <ErrorBanner>{deleteError}</ErrorBanner> : null}
    </Screen>
  );
}
