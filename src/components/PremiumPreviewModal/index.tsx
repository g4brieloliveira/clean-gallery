import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/tokens';
import {
  Backdrop,
  Body,
  CloseButton,
  Feature,
  FeatureLabel,
  Footnote,
  Panel,
  PrimaryButton,
  PrimaryLabel,
  RestoreButton,
  RestoreLabel,
  Title,
} from './styles';

interface PremiumPreviewModalProps {
  readonly visible: boolean;
  readonly loading: boolean;
  readonly message: string | null;
  readonly testMode: boolean;
  readonly onClose: () => void;
  readonly onPurchase: () => void;
  readonly onRestore: () => void;
}

export function PremiumPreviewModal(
  props: PremiumPreviewModalProps,
): React.JSX.Element {
  const { t } = useTranslation();
  const {
    visible,
    loading,
    message,
    testMode,
    onClose,
    onPurchase,
    onRestore,
  } = props;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Backdrop>
        <Panel accessibilityViewIsModal>
          <CloseButton
            onPress={onClose}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('premium.close')}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </CloseButton>
          <Ionicons name="sparkles-outline" size={34} color={colors.brandSoft} />
          <Title accessibilityRole="header">{t('premium.title')}</Title>
          <Body>{t('premium.body')}</Body>
          <Feature>
            <Ionicons name="infinite-outline" size={20} color={colors.keep} />
            <FeatureLabel>{t('premium.unlimited')}</FeatureLabel>
          </Feature>
          <Feature>
            <Ionicons name="ban-outline" size={20} color={colors.keep} />
            <FeatureLabel>{t('premium.noAds')}</FeatureLabel>
          </Feature>
          <PrimaryButton
            onPress={onPurchase}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={
              testMode ? t('premium.purchaseTest') : t('premium.purchase')
            }
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <PrimaryLabel>
                {testMode ? t('premium.purchaseTest') : t('premium.purchase')}
              </PrimaryLabel>
            )}
          </PrimaryButton>
          <RestoreButton
            onPress={onRestore}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('premium.restore')}
          >
            <RestoreLabel>{t('premium.restore')}</RestoreLabel>
          </RestoreButton>
          <Footnote>
            {message ??
              (testMode
                ? t('premium.testNote')
                : t('premium.priceNote'))}
          </Footnote>
        </Panel>
      </Backdrop>
    </Modal>
  );
}
