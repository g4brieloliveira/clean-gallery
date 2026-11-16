import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SplashRoot = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  padding: ${({ theme }) => theme.spacing.xxl}px;
`;

export const SplashCaption = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xxl}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  font-weight: 600;
  letter-spacing: 0.2px;
  opacity: 0.92;
  text-align: center;
`;
