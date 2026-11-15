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
          <Title>Mover para Apagados Recentemente?</Title>
          <Body>
            {pendingDeleteCount} mídia{pendingDeleteCount === 1 ? '' : 's'} será
            {pendingDeleteCount === 1 ? '' : 'ão'} removida
            {pendingDeleteCount === 1 ? '' : 's'} da galeria. O Kleen não poderá restaurá-la
            {pendingDeleteCount === 1 ? '' : 's'}, e o espaço pode não ser liberado imediatamente.
          </Body>
          <Row>
            <GhostButton onPress={onCancel} disabled={loading}>
              <GhostLabel>Cancelar</GhostLabel>
            </GhostButton>
            <DangerButton onPress={onConfirm} disabled={loading}>
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
