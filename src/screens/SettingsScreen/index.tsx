import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Linking, Modal, Share } from 'react-native';
import type { SettingsScreenProps } from '../../navigation/types';
import {
  FREE_DAILY_REVIEWS,
  MAX_REWARDED_ADS_PER_DAY,
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
        setMessage('Compra restaurada. Premium ativo.');
      } else if (result === 'inactive') {
        setPremiumStatus('inactive');
        setMessage('Nenhuma assinatura ativa foi encontrada.');
      } else {
        setMessage(
          'Restauração disponível apenas no build nativo com a App Store configurada.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [setPremiumStatus]);

  const shareDiagnostics = useCallback(async () => {
    const log = await exportLocalErrorLog();
    await Share.share({
      title: 'Relatório técnico Kleen',
      message: [
        'Kleen — relatório técnico local',
        'Não contém fotos, vídeos ou URIs da galeria.',
        '',
        log,
      ].join('\n'),
    });
  }, []);

  const clearDiagnostics = useCallback(async () => {
    await clearLocalErrorLog();
    setMessage('Relatório técnico local apagado.');
  }, []);

  const replayOnboarding = useCallback(() => {
    resetOnboarding();
    navigation.popToTop();
  }, [navigation, resetOnboarding]);

  const isPremium = premiumStatus === 'active';
  const planLabel = isPremium ? 'Premium' : 'Free';
  const quotaLabel = isPremium
    ? 'Revisões ilimitadas'
    : `${reviewsRemaining ?? 0} restantes hoje`;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header>
        <BackButton
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar aos álbuns"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </BackButton>
        <HeaderTitle accessibilityRole="header">Configurações</HeaderTitle>
      </Header>

      <Scroll contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionTitle>Plano</SectionTitle>
        <Card>
          <CardBody>
            <CardTitle>Seu plano</CardTitle>
            <PlanBadge $premium={isPremium}>
              <PlanBadgeLabel>{planLabel}</PlanBadgeLabel>
            </PlanBadge>
            <QuotaText>{quotaLabel}</QuotaText>
            {!isPremium ? (
              <InfoText>
                Hipótese atual: {FREE_DAILY_REVIEWS} revisões grátis/dia; anúncio
                de teste libera +{REWARDED_AD_BONUS_REVIEWS}, até{' '}
                {MAX_REWARDED_ADS_PER_DAY} vezes/dia.
              </InfoText>
            ) : null}
          </CardBody>
          <SettingsRow
            icon="refresh-outline"
            label="Restaurar compras"
            meta={loading ? 'Verificando…' : undefined}
            onPress={() => void restorePurchase()}
          />
          <SettingsRow
            icon="card-outline"
            label="Gerenciar assinatura"
            onPress={() => void Linking.openURL(SUBSCRIPTIONS_URL)}
          />
        </Card>

        <SectionTitle>Conta</SectionTitle>
        <Card>
          <CardBody>
            <CardTitle>Sem cadastro necessário</CardTitle>
            <InfoText>
              O Kleen não exige login. Quando habilitado, o Premium fica ligado
              ao Apple ID e pode ser restaurado pela App Store.
            </InfoText>
          </CardBody>
        </Card>

        <SectionTitle>Privacidade e suporte</SectionTitle>
        <Card>
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Política de privacidade"
            onPress={() => setPrivacyVisible(true)}
          />
          <SettingsRow
            icon="mail-outline"
            label="Falar com o suporte"
            onPress={() => void Linking.openURL(SUPPORT_EMAIL)}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Compartilhar relatório técnico"
            meta="Sem fotos"
            onPress={() => void shareDiagnostics()}
            accessibilityLabel="Compartilhar relatório técnico sem fotos, vídeos ou endereços da galeria"
          />
          <SettingsRow
            icon="trash-bin-outline"
            label="Apagar relatório técnico"
            onPress={() => void clearDiagnostics()}
          />
        </Card>

        <SectionTitle>Ajuda</SectionTitle>
        <Card>
          <SettingsRow
            icon="play-circle-outline"
            label="Ver introdução novamente"
            onPress={replayOnboarding}
          />
        </Card>

        {message ? <StatusMessage accessibilityRole="text">{message}</StatusMessage> : null}
        <InfoText>Kleen 1.0.0 · Processamento local da fototeca</InfoText>
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
              Privacidade no Kleen
            </PrivacyTitle>
            <PrivacyBody>
              Fotos e vídeos são processados localmente no iPhone e não são
              enviados ao Kleen. O app não exige cadastro. Decisões, quota e
              preferências ficam no armazenamento local. O relatório técnico
              não inclui mídias nem endereços da fototeca e só é compartilhado
              quando você escolhe enviá-lo.
            </PrivacyBody>
            <PrivacyBody>
              Compras e anúncios reais ainda não estão ativos. A política será
              atualizada antes dessas integrações.
            </PrivacyBody>
            <PrivacyButton
              onPress={() => setPrivacyVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar política de privacidade"
            >
              <PrivacyButtonLabel>Entendi</PrivacyButtonLabel>
            </PrivacyButton>
          </PrivacyCard>
        </PrivacyBackdrop>
      </Modal>
    </Screen>
  );
}
