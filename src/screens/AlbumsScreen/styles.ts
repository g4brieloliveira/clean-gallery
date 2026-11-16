import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundPure};
`;

export const Content = styled.View`
  flex: 1;
  width: 100%;
  max-width: 520px;
  align-self: center;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.sm}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const HeaderTextBlock = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title + 2}px;
  font-weight: 700;
  letter-spacing: -0.6px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const SummaryCard = styled.View`
  margin-horizontal: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SummaryText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
`;

export const LimitedAccessBanner = styled.Pressable`
  margin-horizontal: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme }) => theme.colors.brandTint};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brandPrimary};
`;

export const LimitedAccessTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.caption + 1}px;
`;

export const LimitedAccessBody = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const SearchRow = styled.View`
  position: relative;
  z-index: 4;
  margin-horizontal: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: center;
`;

export const SearchWrap = styled.View`
  flex: 1;
  height: 52px;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
  border-radius: 26px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body}px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

export const IconButton = styled.Pressable`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const ToolbarRight = styled.View`
  margin-left: auto;
  flex-direction: row;
  align-items: center;
`;

export const Segmented = styled.View`
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.09);
  overflow: hidden;
`;

export const SegmentButton = styled.Pressable<{ $active: boolean }>`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $active }) => ($active ? theme.colors.surfaceElevated : 'transparent')};
`;

export const SortMenu = styled.View`
  position: absolute;
  top: 46px;
  right: 52px;
  min-width: 170px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  z-index: 8;
`;

export const SortBackdrop = styled.Pressable`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 7;
`;

export const SortOption = styled.Pressable<{ $active: boolean }>`
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.brandTint : 'transparent'};
`;

export const SortOptionText = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) => ($active ? theme.colors.brandSoft : theme.colors.textPrimary)};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: ${({ theme }) => theme.typography.caption}px;
`;

export const ListPad = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
`;

export const Centered = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const Muted = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.subtitle}px;
`;

export const PrimaryButton = styled.Pressable`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
`;

export const PrimaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const LoadingOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.backgroundPure};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const LoadingCaption = styled(Muted)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const CheckingCaption = styled(Muted)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const ErrorRowInset = styled.View`
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
`;

export const EmptyListCard = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.06);
`;

export const RandomCard = styled.Pressable`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brandPrimary};
  background-color: ${({ theme }) => theme.colors.brandTint};
  min-height: 88px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

export const RandomIconBox = styled.View`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const RandomTextWrap = styled.View`
  flex: 1;
`;

export const RandomTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body + 1}px;
  font-weight: 800;
`;

export const RandomSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const VirtualAlbumsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const VirtualAlbumCard = styled.Pressable`
  flex: 1;
  min-height: 116px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brandPrimary};
  background-color: ${({ theme }) => theme.colors.brandTint};
  padding: ${({ theme }) => theme.spacing.md}px;
  justify-content: space-between;
`;

export const VirtualAlbumIconBox = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const GridRowWrap = styled.View`
  width: 50%;
  padding-horizontal: 4px;
`;

export const GridCard = styled.Pressable`
  flex: 1;
  margin: 4px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.07);
  overflow: hidden;
`;

export const GridThumb = styled.Image<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
`;

export const GridThumbFallback = styled.View<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const GridMeta = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

export const GridTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.caption + 1}px;
  font-weight: 700;
`;

export const GridSubtitle = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption - 1}px;
`;
