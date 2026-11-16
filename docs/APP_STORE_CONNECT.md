# App Store Connect — setup Kleen

Faça estes passos uma vez antes do primeiro TestFlight.

## 1. Agreements

1. Abra [App Store Connect → Agreements](https://appstoreconnect.apple.com/agreements)
2. Aceite **Paid Apps** (obrigatório para IAP)
3. Preencha dados bancários/fiscais se pedidos

## 2. Bundle ID (Developer portal)

1. [Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Register App ID:
   - Description: `Kleen`
   - Bundle ID: `com.g4brieloliveira.kleen` (Explicit)
   - Capabilities: **In-App Purchase**

## 3. Criar o app

1. [Apps → +](https://appstoreconnect.apple.com/apps)
2. Campos:
   - Platforms: iOS
   - Name: `Kleen: Swipe Photo Cleaner`
   - Primary Language: Portuguese (Brazil) ou English
   - Bundle ID: `com.g4brieloliveira.kleen`
   - SKU: `kleen-ios`
   - User Access: Full Access

## 4. In-App Purchases

Em **Monetization → In-App Purchases**:

| Product ID | Type | Reference name |
|---|---|---|
| `lifetime` | Non-Consumable | Kleen Pro Lifetime |
| `yearly` | Auto-Renewable Subscription | Kleen Pro Yearly |
| `monthly` | Auto-Renewable Subscription | Kleen Pro Monthly |

Para assinaturas:

1. Crie um **Subscription Group** (ex.: `kleen_pro`)
2. Adicione `yearly` e `monthly` no grupo
3. Defina preços localizados (hipótese: faixa mensal R$ 9,90–19,90)
4. Salve e deixe em **Ready to Submit** quando o metadata mínimo estiver ok

## 5. Sandbox testers

1. Users and Access → Sandbox → Testers
2. Crie um Apple ID de teste (não use o Apple ID principal no device)
3. No iPhone: Settings → App Store → Sandbox Account

## 6. Privacy / listing mínimos

Antes do TestFlight externo / review pública:

- Privacy Policy URL ([`PRIVACY.md`](../PRIVACY.md) hospedado)
- Support URL ([`SUPPORT.md`](../SUPPORT.md))
- App Privacy nutrition labels coerentes com processamento local + compras

Screenshots finais podem esperar a submissão pública; Internal Testing não exige listing completo.
