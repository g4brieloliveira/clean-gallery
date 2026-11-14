import styled from 'styled-components/native';
import { Image } from 'react-native';

export const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.05);
`;

export const IconWrap = styled.View<{ $highlight: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.accentGreenHighlight : theme.colors.surfaceElevated};
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const CoverThumb = styled(Image)`
  width: 48px;
  height: 48px;
`;

export const TextBlock = styled.View`
  flex: 1;
`;

export const FallbackIconWrap = styled.View`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 700;
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const Chevron = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 18px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;
