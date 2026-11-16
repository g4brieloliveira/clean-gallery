# RevenueCat — Kleen Pro

## O que já está no app

- SDK: `react-native-purchases` + `react-native-purchases-ui`
- Configure no boot (`App.tsx`)
- Entitlement: `create_an_app_called_kleen_swipe_photo_cleaner_pro`
- Paywall: limite diário → Premium, e Ajustes → Assinar Premium
- Restore: Ajustes → Restaurar compras
- Customer Center: Ajustes → Gerenciar assinatura
- Fonte de verdade: `CustomerInfo` + listener (Zustand `premiumStatus`)

## Produtos esperados no Offering atual

| Package id | Tipo |
|---|---|
| `lifetime` | compra única |
| `yearly` | assinatura anual |
| `monthly` | assinatura mensal |

Todos devem desbloquear o entitlement Pro acima. Crie um Paywall no Offering atual no dashboard.

## Chaves

- Test Store (atual): `test_…` em `src/monetization/config.ts`
- Produção iOS/Android: `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

## Como testar

1. Dashboard: produtos + entitlement + offering + paywall + customer center
2. **Expo Go:** o paywall nativo **não funciona** (Preview API tenta um path de browser e falha com `document is not available`). O app abre um modal de teste local.
3. Compras / paywall reais: **development build** (`eas build` / `expo-dev-client`) + Sandbox Apple

## Código principal

- `src/monetization/config.ts`
- `src/monetization/revenueCat.ts`
- `src/monetization/providers.ts` (`RevenueCatPremiumProvider`)
