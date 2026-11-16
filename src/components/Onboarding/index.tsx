import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';
import {
  Body,
  Card,
  Dots,
  DotProgress,
  DotTrack,
  Footer,
  PrimaryButton,
  PrimaryLabel,
  Screen,
  SecondaryButton,
  SecondaryLabel,
  Slide,
  StepIcon,
  Title,
} from './styles';

const AUTO_ADVANCE_MS = 6000;
const SWIPE_DISTANCE = 45;
const SWIPE_VELOCITY = 0.35;

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
  const slideX = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const timerProgress = useRef(new Animated.Value(0)).current;
  const transitionLocked = useRef(false);
  const step = STEPS[index]!;
  const isLast = index === STEPS.length - 1;

  const transitionTo = useCallback(
    (nextIndex: number, direction: 1 | -1) => {
      if (
        transitionLocked.current ||
        nextIndex < 0 ||
        nextIndex >= STEPS.length ||
        nextIndex === index
      ) {
        return;
      }

      transitionLocked.current = true;
      timerProgress.stopAnimation();
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: direction * -36,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(slideOpacity, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          transitionLocked.current = false;
          return;
        }
        setIndex(nextIndex);
        slideX.setValue(direction * 36);
        Animated.parallel([
          Animated.spring(slideX, {
            toValue: 0,
            damping: 18,
            stiffness: 210,
            mass: 0.7,
            useNativeDriver: true,
          }),
          Animated.timing(slideOpacity, {
            toValue: 1,
            duration: 170,
            useNativeDriver: true,
          }),
        ]).start(() => {
          transitionLocked.current = false;
        });
      });
    },
    [index, slideOpacity, slideX, timerProgress],
  );

  const goNext = useCallback(() => {
    if (isLast) return;
    transitionTo(index + 1, 1);
  }, [index, isLast, transitionTo]);

  const goPrevious = useCallback(() => {
    transitionTo(index - 1, -1);
  }, [index, transitionTo]);

  const handlePrimary = useCallback(() => {
    if (isLast) onComplete();
    else goNext();
  }, [goNext, isLast, onComplete]);

  useEffect(() => {
    timerProgress.stopAnimation();
    timerProgress.setValue(isLast ? 1 : 0);
    if (isLast) return undefined;

    const timer = Animated.timing(timerProgress, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    });
    timer.start(({ finished }) => {
      if (finished) transitionTo(index + 1, 1);
    });
    return () => timer.stop();
  }, [index, isLast, timerProgress, transitionTo]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_event, gesture) => {
          const isSwipe =
            Math.abs(gesture.dx) >= SWIPE_DISTANCE ||
            Math.abs(gesture.vx) >= SWIPE_VELOCITY;
          if (!isSwipe) return;
          if (gesture.dx < 0) goNext();
          else goPrevious();
        },
      }),
    [goNext, goPrevious],
  );

  const activeProgressWidth = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Card {...panResponder.panHandlers}>
        <Slide
          style={{ opacity: slideOpacity, transform: [{ translateX: slideX }] }}
          accessibilityRole="summary"
        >
          <StepIcon>
            <Ionicons name={step.icon} size={36} color={colors.brandSoft} />
          </StepIcon>
          <Title accessibilityRole="header">{step.title}</Title>
          <Body>{step.body}</Body>
        </Slide>
        <Dots
          accessibilityRole="adjustable"
          accessibilityLabel={`Passo ${index + 1} de ${STEPS.length}`}
          accessibilityActions={[
            { name: 'increment', label: 'Próximo passo' },
            { name: 'decrement', label: 'Passo anterior' },
          ]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') goNext();
            if (event.nativeEvent.actionName === 'decrement') goPrevious();
          }}
        >
          {STEPS.map((s, i) => (
            <DotTrack key={s.key} $active={i === index} $complete={i < index}>
              {i === index ? (
                <DotProgress style={{ width: activeProgressWidth }} />
              ) : null}
            </DotTrack>
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
          onPress={handlePrimary}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Começar a usar o Kleen' : 'Próximo passo'}
        >
          <PrimaryLabel>{isLast ? 'Começar' : 'Próximo'}</PrimaryLabel>
        </PrimaryButton>
      </Footer>
    </Screen>
  );
}
