# TestFlight / EAS — Kleen iOS

Bundle ID: `com.g4brieloliveira.kleen`  
SKU ASC: `kleen-ios`  
Nome ASC: **Kleen: Swipe Photo Cleaner**

## Pré-requisitos

1. Apple Developer Program ativo
2. App criado no [App Store Connect](https://appstoreconnect.apple.com) (ver [`APP_STORE_CONNECT.md`](APP_STORE_CONNECT.md))
3. Produtos IAP + RevenueCat com chave `appl_…` (ver [`REVENUECAT.md`](REVENUECAT.md))
4. EAS logado: `eas whoami`

## Comandos

```bash
# Development client (Sandbox / RevenueCat nativo no iPhone)
npm run eas:dev

# Preview interna (adhoc)
npm run eas:preview

# Produção (TestFlight)
npm run eas:prod

# Enviar o último production build ao ASC/TestFlight
npm run eas:submit
```

## Secrets EAS

```bash
eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_XXXX --type string
```

Sem esse secret, o app usa a chave `test_` de fallback (só Test Store / Preview).

## Fluxo recomendado

1. `npm run eas:dev` → instalar no iPhone → tester Sandbox → comprar/restaurar
2. `npm run eas:prod` → `npm run eas:submit`
3. ASC → TestFlight → Internal Testing → convidar Apple IDs
4. Smoke: álbuns, swipe, delete, Premium, restore

## Notas

- Expo Go **não** apresenta paywall nativo.
- `eas.json` production usa `autoIncrement` remoto para `buildNumber`.
- Nenhum segredo Apple/RevenueCat deve ser commitado.
