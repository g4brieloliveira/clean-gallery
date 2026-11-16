import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  readonly titleKey: string;
  readonly bodyKey: string;
}

const STEPS: readonly Step[] = [
  {
    key: 'permission',
    icon: 'images-outline',
    titleKey: 'onboarding.permissionTitle',
    bodyKey: 'onboarding.permissionBody',
  },
  {
    key: 'gestures',
    icon: 'swap-horizontal-outline',
    titleKey: 'onboarding.gesturesTitle',
    bodyKey: 'onboarding.gesturesBody',
  },
  {
    key: 'local',
    icon: 'phone-portrait-outline',
    titleKey: 'onboarding.localTitle',
    bodyKey: 'onboarding.localBody',
  },
  {
    key: 'delete',
    icon: 'trash-outline',
    titleKey: 'onboarding.deleteTitle',
    bodyKey: 'onboarding.deleteBody',
  },
  {
    key: 'support',
    icon: 'document-text-outline',
    titleKey: 'onboarding.supportTitle',
    bodyKey: 'onboarding.supportBody',
  },
];

interface OnboardingProps {
  readonly onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps): React.JSX.Element {
  const { t } = useTranslation();
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
          <Title accessibilityRole="header">{t(step.titleKey)}</Title>
          <Body>{t(step.bodyKey)}</Body>
        </Slide>
        <Dots
          accessibilityRole="adjustable"
          accessibilityLabel={t('onboarding.step', {
            current: index + 1,
            total: STEPS.length,
          })}
          accessibilityActions={[
            { name: 'increment', label: t('onboarding.nextA11y') },
            { name: 'decrement', label: t('onboarding.previousA11y') },
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
          accessibilityLabel={t('onboarding.skipA11y')}
        >
          <SecondaryLabel>{isLast ? ' ' : t('onboarding.skip')}</SecondaryLabel>
        </SecondaryButton>
        <PrimaryButton
          onPress={handlePrimary}
          accessibilityRole="button"
          accessibilityLabel={
            isLast ? t('onboarding.startA11y') : t('onboarding.nextA11y')
          }
        >
          <PrimaryLabel>
            {isLast ? t('onboarding.start') : t('onboarding.next')}
          </PrimaryLabel>
        </PrimaryButton>
      </Footer>
    </Screen>
  );
}
