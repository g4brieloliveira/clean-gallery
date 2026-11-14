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
          <Title>Apagar permanentemente?</Title>
          <Body>
            Você está prestes a remover {pendingDeleteCount} mídia
            {pendingDeleteCount === 1 ? '' : 's'} da galeria do aparelho. Esta ação não pode ser
            desfeita pelo app.
          </Body>
          <Row>
            <GhostButton onPress={onCancel} disabled={loading}>
              <GhostLabel>Cancelar</GhostLabel>
            </GhostButton>
            <DangerButton onPress={onConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <DangerLabel>Apagar agora</DangerLabel>
              )}
            </DangerButton>
          </Row>
        </Panel>
      </Backdrop>
    </Modal>
  );
}
