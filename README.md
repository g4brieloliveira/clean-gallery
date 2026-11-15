# Clean Gallery

App Expo (React Native + TypeScript) para limpar a galeria com gestos de swipe.

## Rodar

Gerenciador oficial: **npm** (ver `docs/tooling.md`).

```bash
npm install
npm start
```

Use o app em um **dispositivo físico** ou emulador com acesso à biblioteca de fotos (Expo Go ou build nativo).

### Scripts

| Comando | Função |
|---|---|
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Jest (`jest-expo`) |
| `npm run doctor` | `expo-doctor` |
| `npm start` | Metro / Expo |

## Fluxo

1. **Álbuns** — escolha modo embaralhado ou um álbum; fotos e vídeos já marcados como “manter” são filtrados.
2. **Swipe** — arraste à esquerda para marcar exclusão; à direita para manter. Há botões na barra como alternativa aos gestos. Vídeos usam controles nativos (play/pause).
3. **Confirmação** — toque na faixa de exclusão ou conclua a fila; o modal pede confirmação antes de `MediaLibrary.deleteAssetsAsync`. No iOS, os itens vão em geral para **Apagados Recentemente** (não é bypass da lixeira do sistema).

## Desempenho e limites

Constantes em `src/services/mediaLibraryService.ts`:

| Modo | Comportamento |
|---|---|
| **Álbum** | Abre com as primeiras ~`100` mídias (`ALBUM_INITIAL_FIRST`); o restante entra em background em páginas de `200`, até o teto `ALBUM_BACKGROUND_MAX_ASSETS` (`8000`). Atingir o teto **não** significa álbum 100% processado. |
| **Embaralhado / aleatório** | Carrega um lote inicial (~`600`), depois páginas de `500` até `RANDOM_MAX_ASSETS` (`25000`). Cada lote é embaralhado localmente — **não** é amostragem global perfeita da biblioteca. Ordenação base: mais recentes primeiro. |
| **iOS** | URIs `ph://` com cache LRU, deduplicação de `getAssetInfoAsync` e prefetch dos próximos cards. |
| **Lista de álbuns** | Miniaturas da mídia mais recente carregam em segundo plano após a lista aparecer. |

## Stack

- Expo SDK 54, `App.tsx` (sem Expo Router)
- Navegação: `@react-navigation/native-stack`
- Estado: Zustand + persistência (`keptAssetIds`, `validatedAlbumIds`) via AsyncStorage
- Mídia: `expo-media-library`
- UI: `styled-components/native` + `Animated` + `PanResponder`

## Docs

- Plano de lançamento: `PLANO_LANCAMENTO.md`
- Checklist de gates: `docs/release-checklist.md`
- Permissões: `docs/permissions.md`
- Tooling: `docs/tooling.md`
