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

## Bloqueio atual (2026-11-16)

`eas device:list` / credentials retornam **No Apple teams found** para a conta Expo `g4brieloliveira`.

Isso normalmente significa:

1. Membership Apple Developer ainda processando após o pagamento, ou
2. O Apple ID do programa ainda não foi vinculado no fluxo interativo do EAS.

### Desbloqueio

1. Confirme em https://developer.apple.com/account que o programa está **Active** e anote o Team ID
2. No Terminal (fora do agente):

```bash
cd ~/www/clean-gallery
npm run eas:dev
# → Yes, log in to Apple account → Apple ID do Developer Program → 2FA
```

3. Com a chave `appl_…` do RevenueCat:

```bash
./scripts/set-revenuecat-ios-key.sh appl_XXXX
```

4. Depois: `npm run eas:prod` e `npm run eas:submit`
