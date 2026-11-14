import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const TitleBlock = styled.View`
  flex: 1;
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;

export const ScreenTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title + 2}px;
  font-weight: 800;
`;

export const AlbumPickerRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const AlbumPickerText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

export const AlbumPickerChevron = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const UndoButton = styled.Pressable<{ $dimmed: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.35 : 1)};
`;

export const DeferButton = styled.Pressable<{ $dimmed: boolean }>`
  width: 44px;
  height: 44px;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.35 : 1)};
`;

export const CardArea = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
`;

export const EmptyTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title}px;
  font-weight: 700;
  text-align: center;
`;

export const EmptyBody = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const DangerCta = styled.Pressable`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.accentRed};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
`;

export const DangerCtaLabel = styled.Text`
  color: ${({ theme }) => theme.colors.accentRed};
  font-weight: 800;
  text-align: center;
`;

export const NeutralCta = styled.Pressable`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.surfaceElevated};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
`;

export const NeutralCtaLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 800;
  text-align: center;
`;

export const PendingStrip = styled.Pressable`
  margin-horizontal: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const PendingStripLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  text-align: center;
`;

export const ErrorBanner = styled.Text`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  text-align: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;
