import styled from 'styled-components/native';

export const BrandRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const BrandMarkFrame = styled.View<{ $compact: boolean }>`
  width: ${({ $compact }) => ($compact ? 28 : 36)}px;
  height: ${({ $compact }) => ($compact ? 28 : 36)}px;
  border-radius: ${({ $compact }) => ($compact ? 7 : 9)}px;
  overflow: hidden;
`;

export const BrandWordmark = styled.Text<{ $compact: boolean }>`
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ $compact, theme }) =>
    $compact ? theme.typography.body : theme.typography.section}px;
  font-weight: 700;
  letter-spacing: -0.3px;
`;

