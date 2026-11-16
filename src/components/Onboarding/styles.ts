import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundPure};
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  justify-content: space-between;
`;

export const Card = styled.View`
  flex: 1;
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

export const Slide = styled(Animated.View)``;

export const StepIcon = styled.View`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  background-color: ${({ theme }) => theme.colors.brandTint};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brandPrimary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title + 4}px;
  font-weight: 800;
  letter-spacing: -0.4px;
`;

export const Body = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 24px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const Dots = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const DotTrack = styled.View<{ $active: boolean; $complete: boolean }>`
  width: ${({ $active }) => ($active ? 28 : 8)}px;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${({ theme, $complete }) =>
    $complete ? theme.colors.brandSoft : theme.colors.surfaceElevated};
`;

export const DotProgress = styled(Animated.View)`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.brandSoft};
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const PrimaryButton = styled.Pressable`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  align-items: center;
`;

export const PrimaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const SecondaryButton = styled.Pressable`
  min-width: 72px;
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
`;

export const SecondaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: ${({ theme }) => theme.typography.caption}px;
`;
