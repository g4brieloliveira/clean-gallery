# RevenueCat — Kleen Pro

> Doc de processo do case study público. A chave `appl_…` de produção vive só no EAS; no código há apenas a chave pública **Test Store** (`test_…`) para desenvolvimento.

## O que já está no app

- SDK: `react-native-purchases` + `react-native-purchases-ui`
- Configure no boot (`App.tsx`)
- Entitlement: `create_an_app_called_kleen_swipe_photo_cleaner_pro`
- Paywall: limite diário → Premium, e Ajustes → Assinar Premium
- Restore: Ajustes → Restaurar compras
- Customer Center: Ajustes → Gerenciar assinatura
- Fonte de verdade: `CustomerInfo` + listener (Zustand `premiumStatus`)

## Produtos esperados no Offering atual

| Store product ID (ASC) | Tipo ASC | Package sugerido no Offering |
|---|---|---|
| `kleen_lifetime` | Não consumível | `lifetime` |
| `kleen_yearly` | Assinatura auto-renovável | `yearly` |
| `kleen_monthly` | Assinatura auto-renovável | `monthly` |

Todos devem desbloquear o entitlement Pro acima. Crie um Paywall + Customer Center no Offering **current**.

## Conectar App Store (produção)

1. No RevenueCat: Project → Apps → iOS app com bundle `com.g4brieloliveira.kleen`
2. Cole a **In-App Purchase Key** (`.p8`) do App Store Connect → Users and Access → Integrations → In-App Purchase
3. Ou Shared Secret legado, se ainda usar
4. Importe / mapeie `kleen_lifetime`, `kleen_yearly`, `kleen_monthly` ao entitlement Pro
5. Offering current com packages apontando a esses store products
6. Copie a API key pública **Apple** (`appl_…`)

### EAS Secret

```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value 'appl_XXXX' --type string
```

Sem o secret, builds usam `test_…` (Test Store) — ok para UI, insuficiente para Sandbox Apple real.

## Chaves no código

- Fallback Test Store: `REVENUECAT_API_KEY_TEST` em `src/monetization/config.ts`
- Runtime iOS: `process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`

## Como testar

1. Dashboard: produtos + entitlement + offering + paywall + customer center
2. **Expo Go:** paywall nativo **não funciona** → modal de teste local
3. **Development build** + Sandbox Apple: paywall nativo + cobrança Sandbox
4. **TestFlight:** mesma chave `appl_…`; testers usam Sandbox / produção conforme ASC

## Código principal

- `src/monetization/config.ts`
- `src/monetization/revenueCat.ts`
- `src/monetization/providers.ts` (`RevenueCatPremiumProvider`)
- `src/monetization/environment.ts` (detecta Expo Go vs native UI)
