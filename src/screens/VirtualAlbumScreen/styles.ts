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
