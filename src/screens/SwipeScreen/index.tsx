import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<string | null>(null);
  const previewPaywall = !premiumProvider.canPresentNativePaywall();

  const { width, height } = Dimensions.get('window');
  const layout = useMemo(() => {
    const cardWidth = width - 40;
    const cardHeight = Math.min(height * 0.62, cardWidth * 1.35);
    const swipeThreshold = width * 0.32;
    return { cardWidth, cardHeight, swipeThreshold };
  }, [height, width]);

  const sessionFinished = queue.length > 0 && currentIndex >= queue.length;
  const isVirtualAlbum =
    album.mode === 'kept' || album.mode === 'pendingDelete';
  const canInteract = isVirtualAlbum || canReviewToday;
  const canUndo = history.length > 0 && !sessionFinished;
  const canDefer =
    !sessionFinished &&
    canInteract &&
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
      if (!isVirtualAlbum && !consumeReview()) {
        setLimitMessage(t('swipe.limitReached'));
        return;
      }
      applySwipe(outcome, currentAsset.id);
    },
    [applySwipe, consumeReview, currentAsset, isVirtualAlbum, t],
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
    if (!isVirtualAlbum) refundReview();
  }, [history.length, isVirtualAlbum, refundReview, undoLast]);

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
        setDeleteError(t('swipe.permissionDelete'));
        setDeleteLoading(false);
        return;
      }
      const ids = [...toDeleteIds];
      const result = await deleteAssetsFromLibrary(ids);
      if (result.deletedIds.length > 0) {
        applyConfirmedDeletes(result.deletedIds);
      }
      if (result.cancelled) {
        setDeleteError(t('swipe.deleteCancelled'));
        setModalOpen(false);
        return;
      }
      if (result.remainingIds.length > 0) {
        setDeleteError(
          result.deletedIds.length > 0
            ? t('swipe.deletePartial', {
                deleted: result.deletedIds.length,
                remaining: result.remainingIds.length,
              })
            : t('swipe.deleteFailed'),
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
      const msg = e instanceof Error ? e.message : t('swipe.deleteGenericError');
      setDeleteError(msg);
      void logLocalError('delete.failed', msg, { pending: toDeleteIds.length });
    } finally {
      setDeleteLoading(false);
    }
  }, [applyConfirmedDeletes, t, toDeleteIds]);

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
            ? t('swipe.moreReviews', { count: REWARDED_AD_BONUS_REVIEWS })
            : t('swipe.bonusFailed'),
        );
        return;
      }
      setLimitMessage(
        result.adResult === 'cancelled'
          ? t('swipe.adCancelled')
          : t('swipe.adUnavailable'),
      );
    } finally {
      setAdLoading(false);
    }
  }, [adLoading, canWatchRewardedAd, grantRewardedAdBonus, t]);

  const onPremium = useCallback(async () => {
    if (premiumLoading) return;
    setLimitMessage(null);
    setPremiumMessage(null);

    if (previewPaywall) {
      setPremiumOpen(true);
      return;
    }

    setPremiumLoading(true);
    try {
      const result = await premiumProvider.purchase();
      if (result === 'active') {
        setPremiumStatus('active');
        setLimitMessage(t('premium.active'));
        return;
      }
      if (result === 'fallback') {
        setPremiumOpen(true);
        return;
      }
      if (result === 'cancelled') return;
      if (result === 'failed') {
        setLimitMessage(t('premium.purchaseFailed'));
        return;
      }
      setLimitMessage(t('premium.purchaseUnavailable'));
    } finally {
      setPremiumLoading(false);
    }
  }, [premiumLoading, previewPaywall, setPremiumStatus, t]);

  const onPurchasePremium = useCallback(async () => {
    setPremiumLoading(true);
    setPremiumMessage(null);
    try {
      if (previewPaywall) {
        await premiumProvider.activatePreviewPremium();
        setPremiumStatus('active');
        setPremiumOpen(false);
        setLimitMessage(t('premium.active'));
        return;
      }
      const result = await premiumProvider.purchase();
      if (result === 'active') {
        setPremiumStatus('active');
        setPremiumOpen(false);
        setLimitMessage(t('premium.active'));
        return;
      }
      if (result === 'cancelled') return;
      setPremiumMessage(
        result === 'failed'
          ? t('premium.purchaseFailed')
          : t('premium.purchaseUnavailable'),
      );
    } finally {
      setPremiumLoading(false);
    }
  }, [previewPaywall, setPremiumStatus, t]);

  const onRestorePremium = useCallback(async () => {
    setPremiumLoading(true);
    setPremiumMessage(null);
    try {
      const result = await premiumProvider.restore();
      if (result === 'active') {
        setPremiumStatus('active');
        setPremiumOpen(false);
        setLimitMessage(t('premium.restored'));
        return;
      }
      if (result === 'inactive') {
        setPremiumMessage(t('premium.noActive'));
        return;
      }
      setPremiumMessage(t('premium.restoreFailed'));
    } finally {
      setPremiumLoading(false);
    }
  }, [setPremiumStatus, t]);

  const emptyQueueOnArrival = queue.length === 0;
  const reviewedCount = sessionDeleteCount + sessionKeepCount;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <TopRow>
        <BackButton
          onPress={openAlbums}
          accessibilityRole="button"
          accessibilityLabel={t('common.backToAlbums')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </BackButton>
        <TitleBlock>
          <ScreenTitle>{t('swipe.title')}</ScreenTitle>
          <AlbumPickerRow onPress={openAlbums}>
            <Ionicons name="images-outline" size={18} color={colors.textSecondary} />
            <AlbumPickerText>
              {album.title} · {t('common.remaining', { count: remaining })}
              {reviewsRemainingToday === null
                ? ` · ${t('swipe.premium')}`
                : ` · ${t('swipe.today', { count: reviewsRemainingToday })}`}{' '}
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
            accessibilityLabel={t('swipe.another')}
          >
            <Ionicons name="shuffle-outline" size={22} color={colors.textSecondary} />
          </DeferButton>
          <UndoButton
            onPress={onUndo}
            disabled={!canUndo}
            $dimmed={!canUndo}
            accessibilityRole="button"
            accessibilityLabel={t('swipe.undo')}
          >
            <Ionicons name="arrow-undo" size={22} color={colors.textSecondary} />
          </UndoButton>
        </HeaderActions>
      </TopRow>

      {showPartialLimit ? (
        <PartialLimitBanner accessibilityRole="text">
          {t('swipe.largeAlbum')}
        </PartialLimitBanner>
      ) : null}

      {emptyQueueOnArrival ? (
        <CardArea>
          <EmptyTitle>{t('swipe.emptyTitle')}</EmptyTitle>
          <EmptyBody>{t('swipe.emptyBody')}</EmptyBody>
          <NeutralCta onPress={openAlbums}>
            <NeutralCtaLabel>{t('swipe.chooseAlbum')}</NeutralCtaLabel>
          </NeutralCta>
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && currentAsset && canInteract ? (
        <CardArea>
          <SwipeCard
            key={currentAsset.id}
            asset={currentAsset}
            cardWidth={layout.cardWidth}
            cardHeight={layout.cardHeight}
            swipeThreshold={layout.swipeThreshold}
            onCommit={commitReview}
            onAssetLoadFailed={onAssetLoadFailed}
            disabled={!canInteract}
          />
        </CardArea>
      ) : null}

      {!emptyQueueOnArrival && currentAsset && !canInteract ? (
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
          <EmptyTitle>{t('swipe.done')}</EmptyTitle>
          <EmptyBody>
            {t('swipe.reviewed', { count: reviewedCount })} ·{' '}
            {t('swipe.kept', { count: sessionKeepCount })}
            {sessionRemovedCount > 0
              ? ` · ${t('swipe.removed', { count: sessionRemovedCount })}`
              : toDeleteIds.length > 0
                ? ` · ${t('swipe.ready', { count: toDeleteIds.length })}`
                : ''}
            {sessionFailedCount > 0
              ? ` · ${t('swipe.failure', { count: sessionFailedCount })}`
              : ''}
            .
          </EmptyBody>
          {toDeleteIds.length > 0 ? (
            <DangerCta onPress={() => setModalOpen(true)}>
              <DangerCtaLabel>
                {t('swipe.reviewRemove', { count: toDeleteIds.length })}
              </DangerCtaLabel>
            </DangerCta>
          ) : (
            <NeutralCta onPress={openAlbums}>
              <NeutralCtaLabel>{t('swipe.back')}</NeutralCtaLabel>
            </NeutralCta>
          )}
        </CardArea>
      ) : null}

      {toDeleteIds.length > 0 && currentAsset && !sessionFinished && canInteract ? (
        <PendingStrip onPress={() => setModalOpen(true)}>
          <PendingStripLabel>
            {t('swipe.pendingStrip', { count: toDeleteIds.length })}
          </PendingStripLabel>
        </PendingStrip>
      ) : null}

      {!emptyQueueOnArrival && !sessionFinished && canInteract ? (
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
        testMode={previewPaywall}
        onClose={() => setPremiumOpen(false)}
        onPurchase={() => void onPurchasePremium()}
        onRestore={() => void onRestorePremium()}
      />

      {deleteError ? <ErrorBanner>{deleteError}</ErrorBanner> : null}
    </Screen>
  );
}
