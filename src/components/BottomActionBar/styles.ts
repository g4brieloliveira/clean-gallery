import styled from 'styled-components/native';

export const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.borderNeutral};
  background-color: ${({ theme }) => theme.colors.backgroundPure};
`;

export const CircleButton = styled.TouchableOpacity<{ $variant: 'delete' | 'keep'; $muted: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${({ theme, $variant }) =>
    $variant === 'delete' ? theme.colors.remove : theme.colors.keep};
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
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
