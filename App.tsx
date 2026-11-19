import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandSplash } from './src/components/BrandSplash';
import { warmUpAdMob } from './src/monetization/admobRewarded';
import { premiumProvider } from './src/monetization/providers';
import { addPremiumStatusListener } from './src/monetization/revenueCat';
import { AppNavigator } from './src/navigation/AppNavigator';
import { filterExistingAssetIds } from './src/services/mediaLibraryService';
import { useGalleryStore } from './src/store/galleryStore';
import { useMonetizationStore } from './src/store/monetizationStore';
import { appTheme } from './src/theme/appTheme';
import './src/i18n';

function HydrationGate({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const galleryHydrated = useGalleryStore((s) => s.hasHydrated);
  const monetizationHydrated = useMonetizationStore((s) => s.hasHydrated);
  const hasHydrated = galleryHydrated && monetizationHydrated;

  useEffect(() => {
    if (!galleryHydrated) return;

    let cancelled = false;
    void (async () => {
      const { keptAssetIds, toDeleteIds, reconcileKeptAssetIds } = useGalleryStore.getState();
      const ids = [...new Set([...keptAssetIds, ...toDeleteIds])];
      if (ids.length === 0) return;
      try {
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
  }, [galleryHydrated]);

  useEffect(() => {
    if (!monetizationHydrated) return;
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      try {
        await Promise.all([premiumProvider.configure(), warmUpAdMob()]);
        if (cancelled) return;
        removeListener = addPremiumStatusListener((status) => {
          useMonetizationStore.getState().setPremiumStatus(status);
        });
        const status = await premiumProvider.getStatus();
        if (!cancelled) {
          useMonetizationStore.getState().setPremiumStatus(status);
        }
      } catch (error) {
        console.warn('[App] RevenueCat bootstrap failed', error);
        if (!cancelled) {
          useMonetizationStore.getState().setPremiumStatus('unknown');
        }
      }
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [monetizationHydrated]);

  if (!hasHydrated) {
    return <BrandSplash />;
  }

  return <>{children}</>;
}

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={appTheme}>
          <HydrationGate>
            <AppNavigator />
          </HydrationGate>
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
