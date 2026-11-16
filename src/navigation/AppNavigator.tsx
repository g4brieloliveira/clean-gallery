import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlbumsScreen } from '../screens/AlbumsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { colors } from '../theme/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accentGreen,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.surface,
    notification: colors.accentRed,
  },
};

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Albums"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Albums" component={AlbumsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{
            // Keep edge-swipe free for keep/delete; back is an explicit control.
            gestureEnabled: false,
            fullScreenGestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
