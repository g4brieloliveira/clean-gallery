# Clean Gallery

App Expo (React Native + TypeScript) para limpar a galeria com gestos de swipe.

## Rodar

```bash
npm install
npx expo start
```

Use o app em um **dispositivo físico** ou emulador com acesso à biblioteca de fotos (Expo Go ou build nativo).

## Fluxo

1. **Álbuns** — escolha `Aleatório` ou um álbum; fotos e vídeos já marcados como “manter” são filtrados.
2. **Swipe** — arraste à esquerda (vermelho) para marcar exclusão; à direita (verde) para manter. Vídeos usam controles nativos (play/pause).
3. **Confirmação** — toque na faixa de exclusão ou conclua a fila; o modal pede confirmação antes de `MediaLibrary.deleteAssetsAsync`.

## Desempenho

- **Álbum**: abre com as primeiras ~100 mídias; o restante entra na fila em segundo plano.
- **Aleatório**: carrega **toda** a galeria (fotos + vídeos, até limite de segurança), depois embaralha — pode demorar em bibliotecas enormes; o overlay “Carregando mídias…” fica visível até terminar.
- **iOS**: URIs `ph://` com cache, deduplicação de `getAssetInfoAsync` e prefetch dos próximos cards.
- **Lista de álbuns**: miniaturas da mídia mais recente de cada álbum carregam em segundo plano após a lista aparecer.

## Stack

- Expo SDK 54, `App.tsx` (sem Expo Router)
- Navegação: `@react-navigation/native-stack`
- Estado: Zustand + persistência (`keptAssetIds`) via AsyncStorage
- Mídia: `expo-media-library`
- UI: `styled-components/native` + `Animated` + `PanResponder`
