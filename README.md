# Kleen: Swipe Photo Cleaner

App Expo (React Native + TypeScript) para revisar e organizar a galeria com gestos de swipe.

**Your photos. Your choice.**

Identidade e diretrizes de produto: [`docs/brand/BRAND_MANUAL.md`](docs/brand/BRAND_MANUAL.md).

## Rodar

Gerenciador oficial: **npm** (ver `docs/tooling.md`).

```bash
npm install
npm start
```

Use o app em um **dispositivo físico** ou emulador com acesso à biblioteca de fotos (Expo Go ou build nativo).

### Builds EAS

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform ios
```

Os três perfis estão em `eas.json`. O build assinado para aparelho físico depende do acesso Apple
e das credenciais acompanhadas em CG-12; nenhum segredo deve ser versionado.

### Scripts

| Comando | Função |
|---|---|
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Jest (`jest-expo`) |
| `npm run doctor` | `expo-doctor` |
| `npm start` | Metro / Expo |

## Fluxo

1. **Onboarding** — na primeira abertura: permissão, gestos, processamento local e remoção no iOS.
2. **Álbuns** — escolha **Embaralhado** (lotes misturados, não amostragem global) ou um álbum; o total exibido é de **mídias únicas** na biblioteca. Acesso limitado à fototeca mostra um banner com atalho para Ajustes.
3. **Swipe** — arraste à esquerda para marcar remoção; à direita para manter. Há botões na barra como alternativa aos gestos (acessibilidade). Vídeos usam controles nativos (play/pause).
4. **Confirmação** — toque na faixa de remoção ou conclua a fila; o modal explica **Apagados Recentemente**. O resumo da sessão usa **contagens**, sem GB inventados.

## Desempenho e limites

Constantes em `src/services/mediaLibraryService.ts`:

| Modo | Comportamento |
|---|---|
| **Álbum** | Abre com as primeiras ~`100` mídias (`ALBUM_INITIAL_FIRST`); o restante entra em background em páginas de `200`, até o teto `ALBUM_BACKGROUND_MAX_ASSETS` (`8000`). Atingir o teto **não** significa álbum 100% processado. |
| **Embaralhado** (`mode: random`) | Carrega um lote inicial (~`600`), depois páginas de `500` até `RANDOM_MAX_ASSETS` (`25000`). Cada lote é embaralhado localmente — **não** é amostragem global perfeita da biblioteca (CG-51 decisão A). Ordenação base: mais recentes primeiro. |
| **iOS** | URIs `ph://` com cache LRU, deduplicação de `getAssetInfoAsync` e prefetch dos próximos cards. |
| **Lista de álbuns** | Miniaturas da mídia mais recente carregam em segundo plano após a lista aparecer. |

## Stack

- Expo SDK 58, `App.tsx` (sem Expo Router)
- Navegação: `@react-navigation/native-stack`
- Estado: Zustand + persistência (`keptAssetIds`, `validatedAlbumIds`, `toDeleteIds`, `hasSeenOnboarding`) via AsyncStorage
- Mídia: `expo-media-library/legacy`
- UI: `styled-components/native` + `Animated` + `PanResponder`

## Docs

- Plano de lançamento: `PLANO_LANCAMENTO.md`
- Checklist de gates: `docs/release-checklist.md`
- Permissões: `docs/permissions.md`
- Tooling: `docs/tooling.md`
