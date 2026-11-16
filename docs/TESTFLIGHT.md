# TestFlight / EAS — Kleen iOS

Bundle ID: `com.g4brieloliveira.kleen`  
SKU ASC: `kleen-ios`  
Nome ASC: **Kleen: Swipe Photo Cleaner**

## Pré-requisitos

1. Apple Developer Program **ativo** (membership pode levar algumas horas após o pagamento)
2. Apple ID do programa vinculado ao EAS na primeira build (`eas build` → Log in to Apple)
3. Confirme: `eas device:list` deixa de falhar com “No Apple teams found”
4. App criado no [App Store Connect](https://appstoreconnect.apple.com) (ver [`APP_STORE_CONNECT.md`](APP_STORE_CONNECT.md))
5. Produtos IAP + RevenueCat com chave `appl_…` (ver [`REVENUECAT.md`](REVENUECAT.md))
6. EAS logado: `eas whoami`

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

## Team Apple

- Team: Gabriel Augusto de Oliveira Pinto (Individual)
- Team ID: `8995YSQ8Y3`

## Erro “integridade não pôde ser verificada”

Build `internal` só instala em devices **registrados antes** do build.  
Guia completo: [`INSTALL_DEV_BUILD.md`](INSTALL_DEV_BUILD.md).

Resumo:

```bash
eas device:create --apple-team-id 8995YSQ8Y3   # abra o link no iPhone
eas device:list --apple-team-id 8995YSQ8Y3     # confirme o iPhone
npm run eas:dev                                # NOVO build (o antigo não serve)
```

Instale pelo QR do **novo** build; confie no certificado em Ajustes se pedir.
