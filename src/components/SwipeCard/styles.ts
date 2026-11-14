import { Animated } from 'react-native';
import styled from 'styled-components/native';

export const CardShell = styled(Animated.View)`
  border-radius: ${({ theme }) => theme.radii.xl}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.borderNeutral};
  padding: 3px;
`;

export const ImageClip = styled.View`
  border-radius: ${({ theme }) => theme.radii.lg}px;
  overflow: hidden;
  flex: 1;
`;

export const Photo = styled.Image`
  width: 100%;
  height: 100%;
`;

export const MediaTapArea = styled.Pressable`
  width: 100%;
  height: 100%;
`;

export const ImageLoading = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const ImageErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption}px;
  text-align: center;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
`;

export const Overlay = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: ${({ theme }) => theme.radii.lg}px;
`;

export const FullscreenHintButton = styled.Pressable`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm}px;
  right: ${({ theme }) => theme.spacing.sm}px;
  z-index: 3;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const PreviewModalRoot = styled.Modal``;

export const PreviewBackdrop = styled.View`
  flex: 1;
  background-color: #000000;
  align-items: center;
  justify-content: center;
`;

export const PreviewCloseButton = styled.Pressable`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xl}px;
  right: ${({ theme }) => theme.spacing.lg}px;
  z-index: 4;
  width: 38px;
  height: 38px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.65);
`;

export const PreviewPhoto = styled.Image`
  width: 100%;
  height: 100%;
`;
