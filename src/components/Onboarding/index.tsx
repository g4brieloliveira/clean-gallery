import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';
import {
  Body,
  Card,
  Dots,
  Dot,
  Footer,
  PrimaryButton,
  PrimaryLabel,
  Screen,
  SecondaryButton,
  SecondaryLabel,
  StepIcon,
  Title,
} from './styles';

interface Step {
  readonly key: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
}

const STEPS: readonly Step[] = [
  {
    key: 'permission',
    icon: 'images-outline',
    title: 'Acesso à galeria',
    body: 'O Kleen precisa da sua permissão para ler fotos e vídeos. Tudo fica no aparelho — nada é enviado para a nuvem do app.',
  },
  {
    key: 'gestures',
    icon: 'swap-horizontal-outline',
    title: 'Gestos e botões',
    body: 'Deslize para a direita para manter, para a esquerda para marcar remoção. Os botões na barra fazem o mesmo, com VoiceOver.',
  },
  {
    key: 'local',
    icon: 'phone-portrait-outline',
    title: 'Processamento local',
    body: 'A revisão roda só no seu iPhone. Decisões de “manter” e pendências de remoção ficam salvas neste aparelho.',
  },
  {
    key: 'delete',
    icon: 'trash-outline',
    title: 'Remoção no iOS',
    body: 'Ao confirmar, os itens vão para “Apagados Recentemente” no app Fotos. O Kleen não restaura depois, e o espaço pode não liberar na hora.',
  },
  {
    key: 'support',
    icon: 'document-text-outline',
    title: 'Relatar um problema',
    body: 'Em Configurações, compartilhe o relatório técnico sem fotos, vídeos ou endereços da galeria. Nunca envie suas mídias pessoais ao suporte.',
  },
];

interface OnboardingProps {
  readonly onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps): React.JSX.Element {
  const [index, setIndex] = useState(0);
  const step = STEPS[index]!;
  const isLast = index === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  }, [isLast, onComplete]);

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Card accessibilityRole="summary">
        <StepIcon>
          <Ionicons name={step.icon} size={36} color={colors.brandSoft} />
        </StepIcon>
        <Title accessibilityRole="header">{step.title}</Title>
        <Body>{step.body}</Body>
        <Dots accessibilityRole="adjustable" accessibilityLabel={`Passo ${index + 1} de ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <Dot key={s.key} $active={i === index} />
          ))}
        </Dots>
      </Card>
      <Footer>
        <SecondaryButton
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel="Pular introdução"
        >
          <SecondaryLabel>{isLast ? ' ' : 'Pular'}</SecondaryLabel>
        </SecondaryButton>
        <PrimaryButton
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Começar a usar o Kleen' : 'Próximo passo'}
        >
          <PrimaryLabel>{isLast ? 'Começar' : 'Próximo'}</PrimaryLabel>
        </PrimaryButton>
      </Footer>
    </Screen>
  );
}
