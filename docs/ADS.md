# Anúncios recompensados — Kleen (CG-111)

> Doc de processo do case study público. Unidade IDs de **produção** AdMob ficam em EAS env (`EXPO_PUBLIC_ADMOB_*`); no repo só há sample/TestIds.

## Comportamento

- Limite free: 50 revisões/dia
- Assistir anúncio: **+25** revisões após `completed`
- Sem teto diário de anúncios
- Pro: sem gate de anúncio
- Cancel/falha: **não** credita

## TestFlight (agora)

Usa **Google sample App IDs + TestIds.REWARDED** para não monetizar tráfego de teste:

| Plataforma | App ID (sample) |
|---|---|
| iOS | `ca-app-pub-3940256099942544~1458002511` |
| Android | `ca-app-pub-3940256099942544~3347511713` |

Unidade rewarded de teste iOS: `ca-app-pub-3940256099942544/1712485313`  
(via `TestIds.REWARDED` no código)

## Produção (antes da loja)

1. Crie o app em [AdMob](https://admob.google.com) com bundle `com.g4brieloliveira.kleen`
2. Crie unidade **Rewarded**
3. Substitua no `app.config.js` / EAS env:
   - `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
   - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
   - `EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID`
   - `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID`
4. Rebuild EAS

Nunca use unidades reais em desenvolvimento sem dispositivos de teste cadastrados no AdMob.
