import styled from 'styled-components/native';

export const Backdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.72);
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const Panel = styled.View`
  width: 100%;
  max-width: 440px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderNeutral};
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

export const CloseButton = styled.Pressable`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm}px;
  right: ${({ theme }) => theme.spacing.sm}px;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title}px;
  font-weight: 800;
`;

export const Body = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  line-height: 22px;
  text-align: center;
`;

export const Feature = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
`;

export const FeatureLabel = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const PrimaryButton = styled.Pressable`
  width: 100%;
  min-height: 50px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  align-items: center;
  justify-content: center;
`;

export const PrimaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 800;
`;

export const RestoreButton = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const RestoreLabel = styled.Text`
  color: ${({ theme }) => theme.colors.brandSoft};
  font-size: ${({ theme }) => theme.typography.caption}px;
  font-weight: 700;
`;

export const Footnote = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption}px;
  line-height: 18px;
  text-align: center;
`;
