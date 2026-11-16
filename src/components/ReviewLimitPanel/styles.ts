import styled from 'styled-components/native';

export const Panel = styled.View`
  width: 100%;
  max-width: 440px;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderNeutral};
`;

export const Title = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title}px;
  font-weight: 800;
  text-align: center;
`;

export const Body = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  line-height: 22px;
  text-align: center;
`;

export const Actions = styled.View`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const AdButton = styled.Pressable<{ $dimmed: boolean }>`
  min-height: 50px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  align-items: center;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.45 : 1)};
`;

export const AdButtonLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 800;
`;

export const PremiumButton = styled.Pressable`
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brandPrimary};
  align-items: center;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

export const PremiumButtonLabel = styled.Text`
  color: ${({ theme }) => theme.colors.brandSoft};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 700;
`;

export const DeleteButton = styled.Pressable`
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

export const DeleteButtonLabel = styled.Text`
  color: ${({ theme }) => theme.colors.remove};
  font-size: ${({ theme }) => theme.typography.caption}px;
  font-weight: 700;
`;

export const Note = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  text-align: center;
`;
