import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { PremiumPreviewModal } from '../../components/PremiumPreviewModal';
import { ReviewLimitPanel } from '../../components/ReviewLimitPanel';
import { SwipeCard } from '../../components/SwipeCard';
import { REWARDED_AD_BONUS_REVIEWS } from '../../monetization/policy';
import {
  premiumProvider,
  requestRewardedReviewBonus,
  rewardedAdProvider,
} from '../../monetization/providers';
import type { SwipeScreenProps } from '../../navigation/types';
import {
  deleteAssetsFromLibrary,
  ensureMediaLibraryPermission,
  prefetchDisplayableUris,
} from '../../services/mediaLibraryService';
import { logLocalError } from '../../services/localErrorLog';
import {
  selectCurrentAsset,
  selectRemainingCount,
  useGalleryStore,
} from '../../store/galleryStore';
import { useMonetizationStore } from '../../store/monetizationStore';
import type { SwipeOutcome } from '../../types/domain';
import { colors } from '../../theme/tokens';
import {
  AlbumPickerChevron,
  AlbumPickerRow,
  AlbumPickerText,
  BackButton,
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
  PartialLimitBanner,
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
  const sessionFailedCount = useGalleryStore((s) => s.sessionFailedCount);
  const sessionRemovedCount = useGalleryStore((s) => s.sessionRemovedCount);
  const toDeleteIds = useGalleryStore((s) => s.toDeleteIds);
  const history = useGalleryStore((s) => s.history);
  const sourceLoadState = useGalleryStore((s) => s.sourceLoadState);

  const applySwipe = useGalleryStore((s) => s.applySwipe);
  const skipCurrentAsUnrenderable = useGalleryStore((s) => s.skipCurrentAsUnrenderable);
  const markAlbumValidated = useGalleryStore((s) => s.markAlbumValidated);
  const canMarkAlbumValidated = useGalleryStore((s) => s.canMarkAlbumValidated);
  const undoLast = useGalleryStore((s) => s.undoLast);
  const deferCurrentToEnd = useGalleryStore((s) => s.deferCurrentToEnd);
  const applyConfirmedDeletes = useGalleryStore((s) => s.applyConfirmedDeletes);

  const currentAsset = useGalleryStore(selectCurrentAsset);
  const remaining = useGalleryStore(selectRemainingCount);
  const canReviewToday = useMonetizationStore((s) => s.canReview());
  const reviewsRemainingToday = useMonetizationStore((s) => s.remainingReviews());
  const canWatchRewardedAd = useMonetizationStore((s) => s.canWatchRewardedAd());
  const consumeReview = useMonetizationStore((s) => s.consumeReview);
  const refundReview = useMonetizationStore((s) => s.refundReview);
  const grantRewardedAdBonus = useMonetizationStore((s) => s.grantRewardedAdBonus);
  const setPremiumStatus = useMonetizationStore((s) => s.setPremiumStatus);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<string | null>(null);

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
    canReviewToday &&
    !!currentAsset &&
    queue.length >= 2 &&
    currentIndex < queue.length - 1;
  const showPartialLimit = sourceLoadState === 'partialByLimit';

  useEffect(() => {
    if (sessionFinished && toDeleteIds.length > 0) {
      setModalOpen(true);
    }
  }, [sessionFinished, toDeleteIds.length]);

  useEffect(() => {
    if (!sessionFinished) return;
    if (album.mode !== 'album') return;
    if (!canMarkAlbumValidated()) return;
    markAlbumValidated(album.id);
  }, [album.id, album.mode, canMarkAlbumValidated, markAlbumValidated, sessionFinished, sourceLoadState]);

  useEffect(() => {
    if (queue.length === 0) return;
    const ahead = queue.slice(currentIndex, currentIndex + 12);
    prefetchDisplayableUris(ahead);
  }, [queue, currentIndex]);

  const openAlbums = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const commitReview = useCallback(
    (outcome: SwipeOutcome) => {
      if (!currentAsset) return;
      const liveState = useGalleryStore.getState();
      const liveAsset = liveState.queue[liveState.currentIndex];
      // Guard against duplicate gesture/button callbacks consuming quota after
      // the gallery action already advanced to the next asset.
      if (!liveAsset || liveAsset.id !== currentAsset.id) return;
      if (!consumeReview()) {
        setLimitMessage('Seu limite de revisões de hoje terminou.');
        return;
      }
      applySwipe(outcome, currentAsset.id);
    },
    [applySwipe, consumeReview, currentAsset],
  );

  const onBarDelete = useCallback(() => {
    commitReview('delete');
  }, [commitReview]);

  const onBarKeep = useCallback(() => {
    commitReview('keep');
  }, [commitReview]);

  const onUndo = useCallback(() => {
    if (history.length === 0) return;
    undoLast();
    refundReview();
  }, [history.length, refundReview, undoLast]);

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
        setDeleteError('Permissão necessária para remover mídias.');
        setDeleteLoading(false);
        return;
      }
      const ids = [...toDeleteIds];
      const result = await deleteAssetsFromLibrary(ids);
      if (result.deletedIds.length > 0) {
        applyConfirmedDeletes(result.deletedIds);
      }
      if (result.cancelled) {
        setDeleteError('Remoção cancelada. Nada foi removido da galeria.');
        setModalOpen(false);
        return;
      }
      if (result.remainingIds.length > 0) {
        setDeleteError(
          result.deletedIds.length > 0
            ? `${result.deletedIds.length} removida(s); ${result.remainingIds.length} ainda pendente(s).`
            : 'Não foi possível remover as mídias selecionadas.',
        );
        void logLocalError('delete.partial', 'Partial or failed delete', {
          deleted: result.deletedIds.length,
          remaining: result.remainingIds.length,
        });
        if (result.deletedIds.length === 0) {
          setDeleteLoading(false);
          return;
        }
      }
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao remover.';
      setDeleteError(msg);
      void logLocalError('delete.failed', msg, { pending: toDeleteIds.length });
    } finally {
      setDeleteLoading(false);
    }
  }, [applyConfirmedDeletes, toDeleteIds]);

  const onWatchRewardedAd = useCallback(async () => {
    if (!canWatchRewardedAd || adLoading) return;
    setAdLoading(true);
    setLimitMessage(null);
    try {
      const result = await requestRewardedReviewBonus(
        rewardedAdProvider,
        grantRewardedAdBonus,
      );
      if (result.adResult === 'completed') {
        setLimitMessage(
          result.granted
            ? `Mais ${REWARDED_AD_BONUS_REVIEWS} revisões liberadas.`
            : 'O teto diário de anúncios foi atingido.',
        );
        return;
      }
      setLimitMessage(
        result.adResult === 'cancelled'
          ? 'Anúncio cancelado; nenhum crédito foi adicionado.'
          : 'Anúncio indisponível agora; nenhum crédito foi adicionado.',
      );
    } finally {
      setAdLoading(false);
    }
  }, [adLoading, canWatchRewardedAd, grantRewardedAdBonus]);

  const onPremium = useCallback(() => {
    setPremiumMessage(null);
    setPremiumOpen(true);
  }, []);

  const onPurchasePremium = useCallback(async () => {
    setPremiumLoading(true);
    setPremiumMessage(null);
    try {
      const result = await premiumProvider.purchase();
      if (result === 'active') {
        setPremiumStatus('active');
        setPremiumMessage('Premium ativado.');
        return;
      }
      setPremiumMessage(
        'Compra indisponível neste build. Nenhuma cobrança foi feita.',
      );
    } finally {
      setPremiumLoading(false);
    }
  }, [setPremiumStatus]);

  const onRestorePremium = useCallback(async () => {
    setPremiumLoading(true);
    setPremiumMessage(null);
    try {
      const result = await premiumProvider.restore();
      if (result === 'active') {
        setPremiumStatus('active');
        setPremiumMessage('Compra restaurada.');
        return;
      }
      if (result === 'inactive') {
        setPremiumStatus('inactive');
        setPremiumMessage('Nenhuma assinatura ativa foi encontrada.');
        return;
      }
      setPremiumMessage(
        'Restauração indisponível neste build. Tente novamente no build nativo.',
      );
    } finally {
      setPremiumLoading(false);
    }
  }, [setPremiumStatus]);

  const emptyQueueOnArrival = queue.length === 0;
  const reviewedCount = sessionDeleteCount + sessionKeepCount;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <TopRow>
        <BackButton
          onPress={openAlbums}
          accessibilityRole="button"
          accessibilityLabel="Voltar aos álbuns"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </BackButton>
        <TitleBlock>
          <ScreenTitle>Revisar</ScreenTitle>
          <AlbumPickerRow onPress={openAlbums}>
            <Ionicons name="images-outline" size={18} color={colors.textSecondary} />
            <AlbumPickerText>
              {album.title} · {remaining} restante{remaining === 1 ? '' : 's'}
              {reviewsRemainingToday === null
                ? ' · Premium'
                : ` · ${reviewsRemainingToday} hoje`}{' '}
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
            onPress={onUndo}
            disabled={!canUndo}
            $dimmed={!canUndo}
            accessibilityRole="button"
            accessibilityLabel="Desfazer última ação"
          >
            <Ionicons name="arrow-undo" size={22} color={colors.textSecondary} />
          </UndoButton>
        </HeaderActions>
      </TopRow>

      {showPartialLimit ? (
        <PartialLimitBanner accessibilityRole="text">
          Esta sessão cobre só parte do álbum por um limite técnico. O álbum não será marcado como
          totalmente revisado.
        </PartialLimitBanner>
      ) : null}

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

      {!emptyQueueOnArrival && currentAsset && canReviewToday ? (
        <CardArea>
          <SwipeCard
            key={currentAsset.id}
            asset={currentAsset}
            cardWidth={layout.cardWidth}
            cardHeight={layout.cardHeight}
            swipeThreshold={layout.swipeThreshold}
            onCommit={commitReview}
            onAssetLoadFailed={onAssetLoadFailed}
            disabled={!canReviewToday}
          />
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && currentAsset && !canReviewToday ? (
        <CardArea>
          <ReviewLimitPanel
            adBonus={REWARDED_AD_BONUS_REVIEWS}
            canWatchAd={canWatchRewardedAd}
            adLoading={adLoading}
            testMode={rewardedAdProvider.mode === 'fake'}
            pendingDeleteCount={toDeleteIds.length}
            message={limitMessage}
            onWatchAd={() => void onWatchRewardedAd()}
            onPremium={() => void onPremium()}
            onReviewDeletes={() => setModalOpen(true)}
          />
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && sessionFinished ? (
        <CardArea>
          <EmptyTitle>Tudo pronto</EmptyTitle>
          <EmptyBody>
            {reviewedCount} revisada{reviewedCount === 1 ? '' : 's'} · {sessionKeepCount} mantida
            {sessionKeepCount === 1 ? '' : 's'}
            {sessionRemovedCount > 0
              ? ` · ${sessionRemovedCount} enviada${sessionRemovedCount === 1 ? '' : 's'} para Apagados Recentemente`
              : toDeleteIds.length > 0
                ? ` · ${toDeleteIds.length} pronta${toDeleteIds.length === 1 ? '' : 's'} para remover`
                : ''}
            {sessionFailedCount > 0
              ? ` · ${sessionFailedCount} falha${sessionFailedCount === 1 ? '' : 's'} de leitura`
              : ''}
            .
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

      {toDeleteIds.length > 0 && currentAsset && !sessionFinished && canReviewToday ? (
        <PendingStrip onPress={() => setModalOpen(true)}>
          <PendingStripLabel>
            {toDeleteIds.length} pronta{toDeleteIds.length === 1 ? '' : 's'} para remover · Revisar
          </PendingStripLabel>
        </PendingStrip>
      ) : null}

      {!emptyQueueOnArrival && !sessionFinished && canReviewToday ? (
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

      <PremiumPreviewModal
        visible={premiumOpen}
        loading={premiumLoading}
        message={premiumMessage}
        testMode={premiumProvider.mode === 'fake'}
        onClose={() => setPremiumOpen(false)}
        onPurchase={() => void onPurchasePremium()}
        onRestore={() => void onRestorePremium()}
      />

      {deleteError ? <ErrorBanner>{deleteError}</ErrorBanner> : null}
    </Screen>
  );
}
