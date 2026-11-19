# App Store Connect — setup Kleen

> Doc de processo do case study público. Não versionar `.p8`, Shared Secret ou credenciais Apple.

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

## 4. In-App Purchases (obrigatório para o paywall — Error 23)

O alerta **Error 23 / ConfigurationError** no TestFlight significa: o RevenueCat
encontrou os product IDs no dashboard, mas o **StoreKit no iPhone não conseguiu
buscar esses produtos no App Store Connect**.

Checklist mínimo:

1. **Agreements** → Paid Apps ativo + banking/tax preenchidos (pode levar horas)
2. Em **Monetization → In-App Purchases / Subscriptions**, crie:

| Product ID (exato) | Type | Reference name |
|---|---|---|
| `kleen_lifetime` | **Não consumível** | Kleen Pro Lifetime |
| `kleen_yearly` | **Assinatura auto-renovável** | Kleen Pro Yearly |
| `kleen_monthly` | **Assinatura auto-renovável** | Kleen Pro Monthly |

> **Atenção:** `kleen_monthly` / `kleen_yearly` **não** podem ser Consumível.
> Consumível não renova e o RevenueCat/StoreKit não trata como assinatura Pro.
> Se já criou como Consumível, remova (ou ignore) e crie de novo em
> **Assinaturas** → Subscription Group (ex. `kleen_pro`).

3. Assinaturas: Subscription Group `kleen_pro` com `kleen_yearly` + `kleen_monthly`
4. Preço localizado + localization (nome/descrição) em pelo menos um idioma
5. Estado: **Ready to Submit** / Preparar para envio com metadata completa
6. No RevenueCat:
   - Importe / crie products com IDs `kleen_lifetime`, `kleen_yearly`, `kleen_monthly`
   - Entitlement `create_an_app_called_kleen_swipe_photo_cleaner_pro`
   - Offering **current** com 3 packages apontando para esses store products
   - Paywall anexado a esse Offering
7. iPhone com **Sandbox Apple ID** em Ajustes → App Store → Conta Sandbox
8. Aguarde até ~2h após criar/corrigir produtos antes de retestar

Sem os passos acima o paywall nativo continua falhando — não é bug do app.

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
