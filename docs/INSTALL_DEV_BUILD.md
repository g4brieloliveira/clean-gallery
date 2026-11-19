# Instalar o development build no iPhone

> Doc de processo do case study público. QR codes e IPA de install interno **não** são versionados.

O erro **“integridade não pôde ser verificada”** em builds `internal` / ad hoc quase sempre significa: **o UDID do iPhone não estava no perfil de provisioning** quando o IPA foi gerado.

## O que já temos

- Team Apple: `Gabriel Augusto de Oliveira Pinto` (`8995YSQ8Y3`)
- Build development concluído (precisa **refazer** depois de registrar o iPhone)
- No EAS só havia um device Mac registrado — **não o iPhone**

## Passo A — Registrar este iPhone (obrigatório)

No Mac, no projeto:

```bash
cd ~/www/clean-gallery
eas device:create --apple-team-id 8995YSQ8Y3
```

1. Escolha registrar via **website / QR**
2. **No iPhone**, abra o link (Safari) e aceite registrar o aparelho
3. Confirme:

```bash
eas device:list --apple-team-id 8995YSQ8Y3
```

Deve aparecer o iPhone (não só o MacBook).

## Passo B — Incluir o iPhone no perfil (obrigatório)

Registrar no EAS **não basta**: o IPA precisa ser assinado de novo com o UDID.

### Opção B1 — Re-assinar o último build (mais rápido)

```bash
eas build:resign --id <BUILD_ID> -p ios -e development --wait
```

Use o ID do build mais recente (`eas build:list --platform ios --limit 1`).

### Opção B2 — Build novo forçando refresh do perfil

```bash
eas build --profile development --platform ios --refresh-ad-hoc-provisioning-profile --wait
```

Quando perguntar quais devices → **marque o iPhone** (checkbox).

### Membership Apple nova

Na primeira vez que um device entra no time, a Apple pode levar **horas** para processar.
Se o resign/build falhar ou o install continuar com “integridade”, espere e tente de novo no dia seguinte,
ou pule ad hoc e use **TestFlight** (não precisa de UDID):

```bash
npm run eas:prod
npm run eas:submit
```

## Passo C — Instalar

1. Abra o link/QR do **novo** build no **Safari do iPhone** (não no Chrome, se possível)
2. Toque em Install
3. Se pedir: **Ajustes → Geral → VPN e gerenciamento de dispositivo** → confiar no certificado do desenvolvedor
4. Abra o app **Kleen** (ícone lilás)

## Passo 3 em diante (RevenueCat + TestFlight) — em português simples

### 3) Chave `appl_…` no RevenueCat

1. Abra [app.revenuecat.com](https://app.revenuecat.com) → seu projeto Kleen  
2. **Project settings → API keys** → chave **Apple** (`appl_…`)  
3. No Mac:

```bash
cd ~/www/clean-gallery
./scripts/set-revenuecat-ios-key.sh appl_COLE_AQUI
```

(Se o script pedir ambiente, use production/development/preview conforme o EAS.)

### 4) Produtos na App Store Connect (se ainda não criou)

Siga [`APP_STORE_CONNECT.md`](APP_STORE_CONNECT.md): app `com.g4brieloliveira.kleen` + IAP `kleen_lifetime` / `kleen_yearly` / `kleen_monthly`.

### 5) Testar compras no development build

1. ASC → Users and Access → Sandbox → criar tester  
2. iPhone → Ajustes → App Store → Conta Sandbox  
3. No Kleen: estourar limite → Conhecer Premium → paywall nativo  
4. Comprar / Restaurar

### 6) TestFlight (depois do Sandbox ok)

```bash
npm run eas:prod
npm run eas:submit
```

No App Store Connect → TestFlight → Internal Testing → convidar Apple IDs.
