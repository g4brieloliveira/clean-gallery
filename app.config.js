const IS_DEV = process.env.APP_ENV === 'development';

/** Home-screen / Springboard name (keep short). Store listing uses ASC name. */
const DISPLAY_NAME = 'Kleen';

/** Google sample App IDs — swap via EXPO_PUBLIC_ADMOB_* for production AdMob. */
const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() ||
  'ca-app-pub-3940256099942544~1458002511';
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() ||
  'ca-app-pub-3940256099942544~3347511713';

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: DISPLAY_NAME,
  slug: 'kleen',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  locales: {
    'pt-BR': './locales/pt-BR.json',
    en: './locales/en.json',
  },
  ios: {
    bundleIdentifier: 'com.g4brieloliveira.kleen',
    supportsTablet: true,
    infoPlist: {
      CFBundleDisplayName: DISPLAY_NAME,
      CFBundleName: DISPLAY_NAME,
      NSPhotoLibraryUsageDescription:
        'O Kleen precisa acessar suas fotos e vídeos para você revisar e organizar sua biblioteca.',
      NSPhotoLibraryAddUsageDescription:
        'O Kleen pode salvar as alterações que você autorizar na sua fototeca.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.g4brieloliveira.kleen',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#9088F0',
    },
    permissions: ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO'],
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_AUDIO',
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-media-library',
      {
        photosPermission:
          'Permitir que o Kleen acesse suas fotos para revisar e organizar sua biblioteca.',
        savePhotosPermission:
          'Permitir que o Kleen salve alterações autorizadas na sua biblioteca.',
        isAccessMediaLocationEnabled: true,
      },
    ],
    'expo-font',
    'expo-video',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#9088F0',
      },
    ],
    'expo-localization',
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: ADMOB_IOS_APP_ID,
        androidAppId: ADMOB_ANDROID_APP_ID,
        userTrackingUsageDescription:
          'O Kleen usa este identificador apenas para exibir anúncios recompensados opcionais.',
      },
    ],
    // Dev client only on development builds — keeps TestFlight free of launcher chrome.
    ...(IS_DEV ? ['expo-dev-client'] : []),
  ],
  extra: {
    eas: {
      projectId: '85d9c103-3742-4f08-ab76-e894dda28196',
    },
  },
  owner: 'g4brieloliveira',
};

module.exports = config;
