import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/tokens';
import {
  Actions,
  AdButton,
  AdButtonLabel,
  Body,
  DeleteButton,
  DeleteButtonLabel,
  Note,
  Panel,
  PremiumButton,
  PremiumButtonLabel,
  Title,
} from './styles';

interface ReviewLimitPanelProps {
  readonly adBonus: number;
  readonly canWatchAd: boolean;
  readonly adLoading: boolean;
  readonly testMode: boolean;
  readonly pendingDeleteCount: number;
  readonly message: string | null;
  readonly onWatchAd: () => void;
  readonly onPremium: () => void;
  readonly onReviewDeletes: () => void;
}

export function ReviewLimitPanel(props: ReviewLimitPanelProps): React.JSX.Element {
  const { t } = useTranslation();
  const {
    adBonus,
    canWatchAd,
    adLoading,
    testMode,
    pendingDeleteCount,
    message,
    onWatchAd,
    onPremium,
    onReviewDeletes,
  } = props;

  return (
    <Panel accessibilityRole="summary">
      <Ionicons name="time-outline" size={38} color={colors.brandSoft} />
      <Title accessibilityRole="header">{t('limit.title')}</Title>
      <Body>
        {t('limit.body', {
          count: adBonus,
          test: testMode ? t('limit.testSuffix') : '',
        })}
      </Body>
      <Actions>
        <AdButton
          onPress={onWatchAd}
          disabled={!canWatchAd || adLoading}
          $dimmed={!canWatchAd || adLoading}
          accessibilityRole="button"
          accessibilityLabel={
            canWatchAd
              ? t('limit.watchA11y', {
                  count: adBonus,
                  test: testMode ? t('limit.testSuffix') : '',
                })
              : t('limit.unavailableA11y')
          }
        >
          {adLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <AdButtonLabel>
              {canWatchAd
                ? t('limit.watch', {
                    count: adBonus,
                    test: testMode ? t('limit.testSuffix') : '',
                  })
                : t('limit.unavailable')}
            </AdButtonLabel>
          )}
        </AdButton>
        <PremiumButton
          onPress={onPremium}
          accessibilityRole="button"
          accessibilityLabel={t('limit.premium')}
        >
          <PremiumButtonLabel>{t('limit.premium')}</PremiumButtonLabel>
        </PremiumButton>
        {pendingDeleteCount > 0 ? (
          <DeleteButton
            onPress={onReviewDeletes}
            accessibilityRole="button"
            accessibilityLabel={t('limit.pending', {
              count: pendingDeleteCount,
            })}
          >
            <DeleteButtonLabel>
              {t('limit.pending', { count: pendingDeleteCount })}
            </DeleteButtonLabel>
          </DeleteButton>
        ) : null}
      </Actions>
      {message ? <Note accessibilityRole="text">{message}</Note> : null}
    </Panel>
  );
}
