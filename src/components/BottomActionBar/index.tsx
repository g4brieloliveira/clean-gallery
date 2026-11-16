import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/tokens';
import type { BottomActionBarProps } from './types';
import {
  Bar,
  Center,
  CircleButton,
  CountDelete,
  CountKeep,
  CountRow,
  CountSep,
  Remaining,
} from './styles';

export function BottomActionBar(props: BottomActionBarProps): React.JSX.Element {
  const { t } = useTranslation();
  const { deleteCount, keepCount, remaining, onDeletePress, onKeepPress, disabled } = props;

  return (
    <Bar>
      <CircleButton
        $variant="delete"
        $muted={disabled}
        onPress={onDeletePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('actions.removeA11y')}
      >
        <Ionicons name="close" size={32} color={colors.textPrimary} />
      </CircleButton>
      <Center>
        <CountRow>
          <CountDelete>{deleteCount}</CountDelete>
          <CountSep> / </CountSep>
          <CountKeep>{keepCount}</CountKeep>
        </CountRow>
        <Remaining>{t('common.remaining', { count: remaining })}</Remaining>
      </Center>
      <CircleButton
        $variant="keep"
        $muted={disabled}
        onPress={onKeepPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('actions.keepA11y')}
      >
        <Ionicons name="checkmark" size={31} color={colors.textPrimary} />
      </CircleButton>
    </Bar>
  );
}
