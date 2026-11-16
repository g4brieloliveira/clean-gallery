import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ptBR } from './locales/pt-BR';

const deviceLanguage = getLocales()[0]?.languageCode === 'en' ? 'en' : 'pt-BR';

void i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: deviceLanguage,
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export { i18n };
