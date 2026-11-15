import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  const { deleteCount, keepCount, remaining, onDeletePress, onKeepPress, disabled } = props;

  return (
    <Bar>
      <CircleButton
        $variant="delete"
        $muted={disabled}
        onPress={onDeletePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Marcar para remover. Alternativa ao gesto de deslizar para a esquerda."
      >
        <Ionicons name="close" size={32} color={colors.textPrimary} />
      </CircleButton>
      <Center>
        <CountRow>
          <CountDelete>{deleteCount}</CountDelete>
          <CountSep> / </CountSep>
          <CountKeep>{keepCount}</CountKeep>
        </CountRow>
        <Remaining>
          {remaining} restante{remaining === 1 ? '' : 's'}
        </Remaining>
      </Center>
      <CircleButton
        $variant="keep"
        $muted={disabled}
        onPress={onKeepPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Manter mídia. Alternativa ao gesto de deslizar para a direita."
      >
        <Ionicons name="checkmark" size={31} color={colors.textPrimary} />
      </CircleButton>
    </Bar>
  );
}
