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
npm run eas:dev      # development client (iPhone)
npm run eas:preview  # distribuição interna
npm run eas:prod     # produção / TestFlight
npm run eas:submit   # envia o último production build ao ASC
```

Guia completo: [`docs/TESTFLIGHT.md`](docs/TESTFLIGHT.md) · ASC: [`docs/APP_STORE_CONNECT.md`](docs/APP_STORE_CONNECT.md).
Nenhum segredo Apple/RevenueCat deve ser versionado.

### Scripts

| Comando | Função |
|---|---|
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Jest (`jest-expo`) |
| `npm run doctor` | `expo-doctor` |
| `npm start` | Metro / Expo |

## Fluxo

1. **Onboarding** — na primeira abertura: permissão, gestos, processamento local, remoção no iOS e suporte seguro.
2. **Álbuns** — escolha **Embaralhado** ou um álbum; veja o total de itens na biblioteca. Acesso limitado à fototeca mostra um banner com atalho para Ajustes. Os álbuns virtuais **Aprovadas** e **Para remover** abrem em grade mesmo com o limite diário esgotado.
3. **Swipe** — arraste à esquerda para marcar remoção; à direita para manter. Há botões na barra como alternativa aos gestos (acessibilidade). Vídeos usam controles nativos (play/pause).
4. **Confirmação** — toque na faixa de remoção ou conclua a fila; o modal explica **Apagados Recentemente**. O resumo da sessão usa **contagens**, sem GB inventados.

## Monetização

- 50 revisões gratuitas/dia (hipótese);
- rewarded ad **de teste** libera +25, sem teto diário;
- Premium via **RevenueCat** (paywall + restore + Customer Center);
- produtos esperados: `monthly`, `yearly`, `lifetime`;
- undo devolve a revisão; falha/skip/defer não consomem;
- remoções já pendentes nunca são bloqueadas pelo limite.

Setup do dashboard e chaves: [`docs/REVENUECAT.md`](docs/REVENUECAT.md).
Hipóteses: [`docs/monetization-hypotheses.md`](docs/monetization-hypotheses.md).

Compras reais exigem development build (não só Expo Go) e Sandbox Apple.

## Configurações e suporte

A tela Configurações informa plano e quota, explica o modelo sem login, oferece
restauração/gerenciamento de assinatura e permite compartilhar um diagnóstico
local sem fotos, vídeos ou URIs da galeria. Também é possível reiniciar o
onboarding. Consulte a [política de privacidade](PRIVACY.md) e o
[canal de suporte](SUPPORT.md).

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
- Hipóteses de monetização: `docs/monetization-hypotheses.md`
- Privacidade: `PRIVACY.md`
- Suporte: `SUPPORT.md`
- Tooling: `docs/tooling.md`
