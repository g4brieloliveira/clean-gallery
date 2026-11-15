# Matriz de permissão (CG-47 / CG-60)

| Estado | Como reproduzir | Esperado | Pass? | Nota |
|---|---|---|---|---|
| Negada / never | Negar no diálogo nativo | Tela com CTA Abrir Ajustes; sem loop | [ ] | |
| Limitada | “Fotos Selecionadas” | Banner “Acesso limitado” + lista parcial | [ ] | |
| Total | “Todas as Fotos” | Sem banner; lista completa disponível | [ ] | |
| Revogada no uso | Ajustes → Kleen → Fotos → Nenhuma, voltar ao app | App detecta no foreground; UI denied ou limited | [ ] | |
| Limited → ampliar | Ajustes altera seleção; volta ao app | Refresh via AppState; banner some se full | [ ] | |

Sem deadlock: o app **não** reabre o diálogo nativo em loop; o caminho é sempre Ajustes.
