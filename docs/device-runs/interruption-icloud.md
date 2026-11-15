# Interrupção / iCloud (CG-49 / CG-58)

| Caso | Passos | Esperado | Pass? |
|---|---|---|---|
| Background no swipe | Home button / gesture; voltar | Sessão intacta; sem crash | [ ] |
| Airplane em iCloud-only | Abrir item só na nuvem com rede off | Erro/skip recuperável; UI não trava | [ ] |
| Mid-download kill | Forçar saída durante preview iCloud | Reabrir sem estado zumbi | [ ] |
| Memória | Sessão longa em álbum grande | Sem freeze permanente; anotar se jettison | [ ] |

Timeouts relevantes: `PREFETCH_DOWNLOAD_TIMEOUT_MS` / resolve URI em `mediaLibraryService.ts`.
