import styled from 'styled-components/native';

export const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const CircleButton = styled.TouchableOpacity<{ $variant: 'delete' | 'keep'; $muted: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  border-width: 2px;
  border-color: ${({ theme, $variant }) =>
    $variant === 'delete' ? theme.colors.accentRed : theme.colors.accentGreen};
  background-color: ${({ theme, $variant }) =>
    $variant === 'delete' ? 'rgba(255, 75, 75, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
  align-items: center;
  justify-content: center;
  opacity: ${({ $muted }) => ($muted ? 0.4 : 1)};
`;

export const Center = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

export const CountRow = styled.Text`
  font-size: ${({ theme }) => theme.typography.title}px;
  font-weight: 700;
`;

export const CountDelete = styled.Text`
  color: ${({ theme }) => theme.colors.accentRed};
`;

export const CountSep = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CountKeep = styled.Text`
  color: ${({ theme }) => theme.colors.accentGreen};
`;

export const Remaining = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.small}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
