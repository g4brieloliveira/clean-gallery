import styled from 'styled-components/native';

export const Backdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.72);
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const DismissLayer = styled.Pressable`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

export const Panel = styled.View`
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  padding: ${({ theme }) => theme.spacing.xxl}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.title}px;
  font-weight: 800;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Body = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  line-height: 22px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const GhostButton = styled.Pressable`
  flex: 1;
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  align-items: center;
`;

export const DangerButton = styled.Pressable`
  flex: 1;
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.accentRed};
  align-items: center;
`;

export const GhostLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const DangerLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 800;
  font-size: ${({ theme }) => theme.typography.body}px;
`;
