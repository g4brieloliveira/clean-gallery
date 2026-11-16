import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Linking, Modal, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SettingsScreenProps } from '../../navigation/types';
import {
  FREE_DAILY_REVIEWS,
  REWARDED_AD_BONUS_REVIEWS,
} from '../../monetization/policy';
import { premiumProvider } from '../../monetization/providers';
import {
  clearLocalErrorLog,
  exportLocalErrorLog,
} from '../../services/localErrorLog';
import { useGalleryStore } from '../../store/galleryStore';
import { useMonetizationStore } from '../../store/monetizationStore';
import { colors } from '../../theme/tokens';
import {
  BackButton,
  Card,
  CardBody,
  CardTitle,
  Header,
  HeaderTitle,
  InfoText,
  PlanBadge,
  PlanBadgeLabel,
  PrivacyBackdrop,
  PrivacyBody,
  PrivacyButton,
  PrivacyButtonLabel,
  PrivacyCard,
  PrivacyTitle,
  QuotaText,
  RowAction,
  RowIcon,
  RowLabel,
  RowMeta,
  Screen,
  Scroll,
  SectionTitle,
  StatusMessage,
} from './styles';

const SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const SUPPORT_EMAIL =
  'mailto:g4brieloliveira.dev@gmail.com?subject=Suporte%20Kleen';

interface SettingsRowProps {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly meta?: string;
  readonly onPress: () => void;
  readonly accessibilityLabel?: string;
}

function SettingsRow(props: SettingsRowProps): React.JSX.Element {
  const { icon, label, meta, onPress, accessibilityLabel } = props;
  return (
    <RowAction
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <RowIcon>
        <Ionicons name={icon} size={20} color={colors.brandSoft} />
      </RowIcon>
      <RowLabel>{label}</RowLabel>
      {meta ? <RowMeta>{meta}</RowMeta> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </RowAction>
  );
}

export function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const premiumStatus = useMonetizationStore((s) => s.premiumStatus);
  const reviewsRemaining = useMonetizationStore((s) => s.remainingReviews());
  const setPremiumStatus = useMonetizationStore((s) => s.setPremiumStatus);
  const resetOnboarding = useGalleryStore((s) => s.resetOnboarding);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const restorePurchase = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await premiumProvider.restore();
      if (result === 'active') {
        setPremiumStatus('active');
        setMessage(t('premium.restored'));
      } else if (result === 'inactive') {
        setPremiumStatus('inactive');
        setMessage(t('premium.noActive'));
      } else {
        setMessage(t('settings.restoreUnavailable'));
      }
    } finally {
      setLoading(false);
    }
  }, [setPremiumStatus, t]);

  const shareDiagnostics = useCallback(async () => {
    const log = await exportLocalErrorLog();
    await Share.share({
      title: t('settings.reportTitle'),
      message: [
        t('settings.reportHeading'),
        t('settings.reportSafe'),
        '',
        log,
      ].join('\n'),
    });
  }, [t]);

  const clearDiagnostics = useCallback(async () => {
    await clearLocalErrorLog();
    setMessage(t('settings.reportCleared'));
  }, [t]);

  const replayOnboarding = useCallback(() => {
    resetOnboarding();
    navigation.popToTop();
  }, [navigation, resetOnboarding]);

  const isPremium = premiumStatus === 'active';
  const planLabel = isPremium ? t('swipe.premium') : t('settings.free');
  const quotaLabel = isPremium
    ? t('settings.unlimited')
    : t('settings.remainingToday', { count: reviewsRemaining ?? 0 });

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
        <HeaderTitle accessibilityRole="header">{t('settings.title')}</HeaderTitle>
      </Header>

      <Scroll contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionTitle>{t('settings.plan')}</SectionTitle>
        <Card>
          <CardBody>
            <CardTitle>{t('settings.yourPlan')}</CardTitle>
            <PlanBadge $premium={isPremium}>
              <PlanBadgeLabel>{planLabel}</PlanBadgeLabel>
            </PlanBadge>
            <QuotaText>{quotaLabel}</QuotaText>
            {!isPremium ? (
              <InfoText>
                {t('settings.hypothesis', {
                  limit: FREE_DAILY_REVIEWS,
                  bonus: REWARDED_AD_BONUS_REVIEWS,
                })}
              </InfoText>
            ) : null}
          </CardBody>
          <SettingsRow
            icon="refresh-outline"
            label={t('settings.restore')}
            meta={loading ? t('settings.checking') : undefined}
            onPress={() => void restorePurchase()}
          />
          <SettingsRow
            icon="card-outline"
            label={t('settings.manage')}
            onPress={() => void Linking.openURL(SUBSCRIPTIONS_URL)}
          />
        </Card>

        <SectionTitle>{t('settings.account')}</SectionTitle>
        <Card>
          <CardBody>
            <CardTitle>{t('settings.noAccountTitle')}</CardTitle>
            <InfoText>{t('settings.noAccountBody')}</InfoText>
          </CardBody>
        </Card>

        <SectionTitle>{t('settings.privacySupport')}</SectionTitle>
        <Card>
          <SettingsRow
            icon="shield-checkmark-outline"
            label={t('settings.privacy')}
            onPress={() => setPrivacyVisible(true)}
          />
          <SettingsRow
            icon="mail-outline"
            label={t('settings.support')}
            onPress={() => void Linking.openURL(SUPPORT_EMAIL)}
          />
          <SettingsRow
            icon="document-text-outline"
            label={t('settings.shareReport')}
            meta={t('settings.noPhotos')}
            onPress={() => void shareDiagnostics()}
            accessibilityLabel={t('settings.shareReportA11y')}
          />
          <SettingsRow
            icon="trash-bin-outline"
            label={t('settings.clearReport')}
            onPress={() => void clearDiagnostics()}
          />
        </Card>

        <SectionTitle>{t('settings.help')}</SectionTitle>
        <Card>
          <SettingsRow
            icon="play-circle-outline"
            label={t('settings.replay')}
            onPress={replayOnboarding}
          />
        </Card>

        {message ? <StatusMessage accessibilityRole="text">{message}</StatusMessage> : null}
        <InfoText>{t('settings.localProcessing')}</InfoText>
      </Scroll>

      <Modal
        visible={privacyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <PrivacyBackdrop>
          <PrivacyCard accessibilityViewIsModal>
            <PrivacyTitle accessibilityRole="header">
              {t('settings.privacyTitle')}
            </PrivacyTitle>
            <PrivacyBody>{t('settings.privacyBody')}</PrivacyBody>
            <PrivacyBody>{t('settings.privacyFuture')}</PrivacyBody>
            <PrivacyButton
              onPress={() => setPrivacyVisible(false)}
              accessibilityRole="button"
              accessibilityLabel={t('settings.privacyCloseA11y')}
            >
              <PrivacyButtonLabel>{t('settings.privacyClose')}</PrivacyButtonLabel>
            </PrivacyButton>
          </PrivacyCard>
        </PrivacyBackdrop>
      </Modal>
    </Screen>
  );
}
