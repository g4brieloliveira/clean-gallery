# Permissões

## iOS

Definidas em `app.json` → `expo.ios.infoPlist` e pelo plugin `expo-media-library`:

| Chave / permissão | Motivo |
|---|---|
| `NSPhotoLibraryUsageDescription` | Ler fotos/vídeos para revisão e limpeza local |
| `NSPhotoLibraryAddUsageDescription` | Declarada pelo plugin para possíveis gravações; o fluxo atual não salva mídia nova na galeria |
| Plugin `photosPermission` / `savePhotosPermission` | Textos exibidos no diálogo nativo do MediaLibrary |

O app processa a fototeca **localmente**. Não há upload da galeria.

## Android

Lista explícita em `app.json` → `expo.android.permissions` (mínimo atual):

| Permissão | Motivo |
|---|---|
| `READ_MEDIA_IMAGES` | Ler imagens (Android 13+) |
| `READ_MEDIA_VIDEO` | Ler vídeos (Android 13+) |

### Removidas (CG-22)

- `READ_EXTERNAL_STORAGE` — legado; substituído por `READ_MEDIA_*` no target atual
- `WRITE_EXTERNAL_STORAGE` — não necessário para o fluxo de revisão/exclusão via MediaLibrary

> Android ainda é pós-iOS no plano de lançamento. Antes de submeter ao Play, revalidar o escopo mínimo por versão da API.

## Plugin `expo-media-library`

```json
{
  "photosPermission": "Permitir que o Kleen acesse suas fotos para revisar sua galeria.",
  "savePhotosPermission": "Permitir que o Kleen salve fotos.",
  "isAccessMediaLocationEnabled": true
}
```

`isAccessMediaLocationEnabled` permanece ligado para metadados de localização da mídia quando o SO expõe; não implica envio a servidor.
