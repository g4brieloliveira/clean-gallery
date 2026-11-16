import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundPure};
`;

export const Header = styled.View`
  min-height: 64px;
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const BackButton = styled.Pressable`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
`;

export const HeaderCopy = styled.View`
  flex: 1;
`;

export const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.section}px;
  font-weight: 700;
`;

export const HeaderSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-top: 2px;
`;

export const ReviewButton = styled.Pressable<{ $dimmed: boolean }>`
  min-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.45 : 1)};
`;

export const ReviewButtonLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  font-weight: 700;
`;

export const Tile = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const FadeTile = styled(Animated.View)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const GridImage = styled.Image<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

export const TileFallback = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const SkeletonPulse = styled(Animated.View)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const SkeletonGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 3px;
  padding-horizontal: 16px;
  padding-bottom: 32px;
`;

export const SkeletonFooter = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 3px;
  padding-top: 3px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const GridGap = styled.View`
  height: 3px;
`;

export const FooterLoader = styled.View`
  min-height: 96px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const EmptyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.section}px;
  font-weight: 700;
`;

export const EmptyBody = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body}px;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const TilePressable = styled.Pressable<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

export const PreviewModalRoot = styled.Modal``;

export const PreviewBackdrop = styled.View`
  flex: 1;
  background-color: #000000;
`;

export const PreviewPage = styled.View`
  align-items: center;
  justify-content: center;
`;

export const PreviewPhoto = styled.Image``;

export const PreviewCloseButton = styled.Pressable`
  position: absolute;
  right: ${({ theme }) => theme.spacing.lg}px;
  z-index: 4;
  width: 38px;
  height: 38px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.65);
`;

export const PreviewCounter = styled.Text`
  position: absolute;
  align-self: center;
  left: 0;
  right: 0;
  z-index: 3;
  text-align: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  font-weight: 600;
`;

export const PreviewStatus = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;
