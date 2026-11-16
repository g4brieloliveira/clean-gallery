import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator } from 'react-native';
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
      <Title accessibilityRole="header">Limite gratuito de hoje atingido</Title>
      <Body>
        Volte amanhã, conheça o Premium ou assista a um anúncio
        {testMode ? ' de teste' : ''} para revisar mais {adBonus} mídias.
      </Body>
      <Actions>
        <AdButton
          onPress={onWatchAd}
          disabled={!canWatchAd || adLoading}
          $dimmed={!canWatchAd || adLoading}
          accessibilityRole="button"
          accessibilityLabel={
            canWatchAd
              ? `Assistir anúncio${testMode ? ' de teste' : ''} e liberar mais ${adBonus} revisões`
              : 'Limite diário de anúncios atingido'
          }
        >
          {adLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <AdButtonLabel>
              {canWatchAd
                ? `Assistir anúncio${testMode ? ' de teste' : ''} · +${adBonus}`
                : 'Limite de anúncios atingido'}
            </AdButtonLabel>
          )}
        </AdButton>
        <PremiumButton
          onPress={onPremium}
          accessibilityRole="button"
          accessibilityLabel="Conhecer Premium"
        >
          <PremiumButtonLabel>Conhecer Premium</PremiumButtonLabel>
        </PremiumButton>
        {pendingDeleteCount > 0 ? (
          <DeleteButton
            onPress={onReviewDeletes}
            accessibilityRole="button"
            accessibilityLabel={`Revisar e remover ${pendingDeleteCount} mídias pendentes`}
          >
            <DeleteButtonLabel>
              Revisar remoções pendentes ({pendingDeleteCount})
            </DeleteButtonLabel>
          </DeleteButton>
        ) : null}
      </Actions>
      {message ? <Note accessibilityRole="text">{message}</Note> : null}
    </Panel>
  );
}
