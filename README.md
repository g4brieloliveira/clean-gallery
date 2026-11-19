# Kleen: Swipe Photo Cleaner

App Expo (React Native + TypeScript) para revisar e organizar a fototeca com gestos de swipe — processamento **local** no aparelho, sem upload da galeria.

**Your photos. Your choice.**

Este repositório é um **case study** público de um app iOS real em rumo a TestFlight/App Store: identidade de produto, fluxo destrutivo seguro, monetização (RevenueCat + AdMob) e docs de lançamento.

Identidade visual/verbal: [`docs/brand/BRAND_MANUAL.md`](docs/brand/BRAND_MANUAL.md).

## Stack

| Camada | Escolha |
|---|---|
| Runtime | Expo SDK 58, React Native, TypeScript |
| UI | `styled-components/native`, React Navigation native-stack |
| Estado | Zustand + AsyncStorage |
| Mídia | `expo-media-library` (acesso local à fototeca) |
| Premium | RevenueCat (`react-native-purchases` + Paywalls UI) |
| Ads | Google Mobile Ads (rewarded; TestIds no TestFlight) |
| Build | EAS Build / Submit → TestFlight |

## Arquitetura (mapa rápido)

```
src/
  monetization/   # quota free, RevenueCat, AdMob rewarded
  store/          # gallery + monetization Zustand stores
  services/       # media library, delete reconcile, error log local
  screens/        # Albums, Swipe, Virtual albums, Settings
  components/     # brand, swipe card, limit panel, paywall fallback
  i18n/           # pt-BR + en
```

## Rodar localmente

Gerenciador oficial: **npm** ([`docs/tooling.md`](docs/tooling.md)).

```bash
npm install
npm start
```

Use um **dispositivo físico** (ou emulador) com biblioteca de fotos.

| Ambiente | O que funciona |
|---|---|
| **Expo Go** | UI, quota, Premium **preview** local; paywall nativo / AdMob **não** |
| **Development build** | RevenueCat nativo + Sandbox Apple + ads nativos |
| **TestFlight** | Build de produção; chave `appl_…` via EAS Secrets |

### Scripts

| Comando | Função |
|---|---|
| `npm start` | Metro / Expo |
| `npm run typecheck` | TypeScript |
| `npm run test` | Jest |
| `npm run doctor` | `expo-doctor` |
| `npm run eas:dev` | Development client iOS |
| `npm run eas:prod` | Produção / TestFlight |
| `npm run eas:submit` | Submit do último production build |

## Fluxo do produto

1. **Onboarding** — permissão, gestos, processamento local, remoção no iOS.
2. **Álbuns** — Embaralhado ou álbum; álbuns virtuais **Aprovadas** / **Para remover**.
3. **Swipe** — esquerda = remover, direita = manter (e botões a11y).
4. **Confirmação** — itens vão para **Apagados Recentemente**; o app não inventa GB liberados.

## Monetização

- 50 revisões free/dia; rewarded ad **+25** após complete (sem teto diário).
- Premium: `kleen_monthly` / `kleen_yearly` (assinaturas) + `kleen_lifetime`.
- Undo devolve revisão; delete já pendente nunca é bloqueado pelo gate.

Docs: [`docs/REVENUECAT.md`](docs/REVENUECAT.md) · [`docs/ADS.md`](docs/ADS.md) · [`docs/monetization-hypotheses.md`](docs/monetization-hypotheses.md).

## Segredos (não versionados)

**Nunca** commit:

- chaves RevenueCat `appl_…` / `sk_…`
- In-App Purchase Key `.p8`
- `.env` real / AdMob unit IDs de produção
- QR de install interno / IPA / provisioning

Use [`.env.example`](.env.example) + EAS Environment Variables. Guia: [`docs/TESTFLIGHT.md`](docs/TESTFLIGHT.md).

## Lançamento (case study)

| Doc | Conteúdo |
|---|---|
| [`PLANO_LANCAMENTO.md`](PLANO_LANCAMENTO.md) | Plano por semanas / gates |
| [`docs/release-checklist.md`](docs/release-checklist.md) | Checklist de gates |
| [`docs/APP_STORE_CONNECT.md`](docs/APP_STORE_CONNECT.md) | App + IAP no ASC |
| [`docs/TESTFLIGHT.md`](docs/TESTFLIGHT.md) | EAS → TestFlight |
| [`docs/INSTALL_DEV_BUILD.md`](docs/INSTALL_DEV_BUILD.md) | Development client / UDID |
| [`docs/device-runs/`](docs/device-runs/) | Roteiros manuais em iPhone |
| [`PRIVACY.md`](PRIVACY.md) / [`SUPPORT.md`](SUPPORT.md) | Privacidade e suporte |

## Licença

[MIT](LICENSE)
