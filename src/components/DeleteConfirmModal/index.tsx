import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../theme/tokens';
import type { DeleteConfirmModalProps } from './types';
import {
  Backdrop,
  Body,
  DangerButton,
  DangerLabel,
  DismissLayer,
  GhostButton,
  GhostLabel,
  Panel,
  Row,
  Title,
} from './styles';

export function DeleteConfirmModal(props: DeleteConfirmModalProps): React.JSX.Element {
  const { visible, pendingDeleteCount, loading, onCancel, onConfirm } = props;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Backdrop>
        <DismissLayer onPress={onCancel} accessibilityLabel="Fechar" />
        <Panel>
          <Title accessibilityRole="header">Mover para Apagados Recentemente?</Title>
          <Body accessibilityRole="text">
            {pendingDeleteCount} mídia{pendingDeleteCount === 1 ? '' : 's'} irá
            {pendingDeleteCount === 1 ? '' : 'ão'} para “Apagados Recentemente” no iOS. O Kleen não
            consegue restaurá-la{pendingDeleteCount === 1 ? '' : 's'} depois, e o espaço pode não ser
            liberado imediatamente.
          </Body>
          <Row>
            <GhostButton
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancelar remoção"
            >
              <GhostLabel>Cancelar</GhostLabel>
            </GhostButton>
            <DangerButton
              onPress={onConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={`Confirmar remoção de ${pendingDeleteCount} mídia${pendingDeleteCount === 1 ? '' : 's'}`}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <DangerLabel>Remover</DangerLabel>
              )}
            </DangerButton>
          </Row>
        </Panel>
      </Backdrop>
    </Modal>
  );
}
