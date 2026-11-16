import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../theme/tokens';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background};
`;

export const Header = styled.View`
  min-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 0 ${spacing.lg}px;
`;

export const BackButton = styled.Pressable`
  width: 42px;
  height: 42px;
  margin-left: -8px;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
`;

export const HeaderTitle = styled.Text`
  color: ${colors.textPrimary};
  font-size: ${typography.title}px;
  font-weight: 700;
  margin-left: ${spacing.sm}px;
`;

export const Scroll = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding: 0 ${spacing.lg}px;
`;

export const SectionTitle = styled.Text`
  color: ${colors.textSecondary};
  font-size: ${typography.caption}px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin: ${spacing.xl}px 0 ${spacing.sm}px ${spacing.xs}px;
`;

export const Card = styled.View`
  background-color: ${colors.surface};
  border: 1px solid ${colors.borderNeutral};
  border-radius: ${radii.lg}px;
  overflow: hidden;
`;

export const CardBody = styled.View`
  padding: ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.borderNeutral};
`;

export const CardTitle = styled.Text`
  color: ${colors.textPrimary};
  font-size: ${typography.body}px;
  font-weight: 700;
`;

export const PlanBadge = styled.View<{ $premium: boolean }>`
  align-self: flex-start;
  margin-top: ${spacing.sm}px;
  padding: 5px 10px;
  border-radius: ${radii.full}px;
  background-color: ${({ $premium }) =>
    $premium ? colors.brandPrimary : colors.surfaceElevated};
  border: 1px solid
    ${({ $premium }) => ($premium ? colors.brandPrimary : colors.borderNeutral)};
`;

export const PlanBadgeLabel = styled.Text`
  color: ${colors.textPrimary};
  font-size: ${typography.caption}px;
  font-weight: 700;
`;

export const QuotaText = styled.Text`
  color: ${colors.brandSoft};
  font-size: ${typography.body}px;
  font-weight: 700;
  margin-top: ${spacing.sm}px;
`;

export const InfoText = styled.Text`
  color: ${colors.textMuted};
  font-size: ${typography.caption}px;
  line-height: 19px;
  margin-top: ${spacing.sm}px;
`;

export const RowAction = styled.Pressable`
  min-height: 58px;
  flex-direction: row;
  align-items: center;
  padding: ${spacing.sm}px ${spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${colors.borderNeutral};
`;

export const RowIcon = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  margin-right: ${spacing.sm}px;
  background-color: ${colors.brandTint};
`;

export const RowLabel = styled.Text`
  flex: 1;
  color: ${colors.textPrimary};
  font-size: ${typography.body}px;
`;

export const RowMeta = styled.Text`
  color: ${colors.textMuted};
  font-size: ${typography.caption}px;
  margin-right: ${spacing.xs}px;
`;

export const StatusMessage = styled.Text`
  color: ${colors.brandSoft};
  font-size: ${typography.caption}px;
  line-height: 19px;
  margin: ${spacing.md}px ${spacing.xs}px 0;
`;

export const PrivacyBackdrop = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${spacing.xl}px;
  background-color: rgba(0, 0, 0, 0.72);
`;

export const PrivacyCard = styled.View`
  width: 100%;
  max-width: 480px;
  align-self: center;
  padding: ${spacing.xl}px;
  border-radius: ${radii.lg}px;
  border: 1px solid ${colors.borderNeutral};
  background-color: ${colors.surface};
`;

export const PrivacyTitle = styled.Text`
  color: ${colors.textPrimary};
  font-size: ${typography.title}px;
  font-weight: 700;
`;

export const PrivacyBody = styled.Text`
  color: ${colors.textSecondary};
  font-size: ${typography.body}px;
  line-height: 23px;
  margin-top: ${spacing.md}px;
`;

export const PrivacyButton = styled.Pressable`
  min-height: 48px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.xl}px;
  border-radius: ${radii.full}px;
  background-color: ${colors.brandPrimary};
`;

export const PrivacyButtonLabel = styled.Text`
  color: ${colors.iconOnAccent};
  font-size: ${typography.body}px;
  font-weight: 700;
`;
