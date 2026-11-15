import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KleenBrand } from './src/components/KleenBrand';
import { AppNavigator } from './src/navigation/AppNavigator';
import { filterExistingAssetIds } from './src/services/mediaLibraryService';
import { useGalleryStore } from './src/store/galleryStore';
import { appTheme } from './src/theme/appTheme';
import { colors } from './src/theme/tokens';

function HydrationGate({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const hasHydrated = useGalleryStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;
    void (async () => {
      const { keptAssetIds, toDeleteIds, reconcileKeptAssetIds } = useGalleryStore.getState();
      const ids = [...new Set([...keptAssetIds, ...toDeleteIds])];
      if (ids.length === 0) return;
      try {
        // Batch existence checks so large keep lists do not block the first frame.
        const existing = await filterExistingAssetIds(ids);
        if (cancelled) return;
        reconcileKeptAssetIds(existing);
      } catch {
        // Leave persisted IDs as-is; next session can retry.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundPure,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <KleenBrand />
        <ActivityIndicator color={colors.brandSoft} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={appTheme}>
        <HydrationGate>
          <AppNavigator />
        </HydrationGate>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
