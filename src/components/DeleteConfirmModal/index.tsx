import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { visible, pendingDeleteCount, loading, onCancel, onConfirm } = props;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Backdrop>
        <DismissLayer
          onPress={onCancel}
          accessibilityLabel={t('common.cancel')}
        />
        <Panel>
          <Title accessibilityRole="header">{t('delete.title')}</Title>
          <Body accessibilityRole="text">
            {t('delete.body', { count: pendingDeleteCount })}
          </Body>
          <Row>
            <GhostButton
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('delete.cancelA11y')}
            >
              <GhostLabel>{t('common.cancel')}</GhostLabel>
            </GhostButton>
            <DangerButton
              onPress={onConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('delete.removeA11y')}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <DangerLabel>{t('delete.remove')}</DangerLabel>
              )}
            </DangerButton>
          </Row>
        </Panel>
      </Backdrop>
    </Modal>
  );
}
