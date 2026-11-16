# QA visual e acessibilidade — Kleen

Data da revisão estática: 2026-11-15

## Verificado

- [x] Paleta usa lilás para marca, verde somente para **Manter** e coral somente para **Remover**.
- [x] Botões de ação principais medem 60 × 60 pt; ações de cabeçalho medem 44 × 44 pt.
- [x] Swipe não é o único caminho: os botões × e ✓ executam as mesmas decisões.
- [x] Ações de cabeçalho e revisão têm `accessibilityRole` e `accessibilityLabel`.
- [x] Confirmação permite cancelar sem alterar a galeria.
- [x] Texto de remoção explica “Apagados Recentemente” e não promete liberação imediata de espaço.
- [x] `npm run typecheck`, `npm run test` e `npm run doctor` concluídos sem erro.
- [x] Diagnósticos do editor sem erros nos arquivos alterados.

## Gate em dispositivo

Estes itens exigem build iOS assinado e permanecem para a validação em aparelho físico:

- [ ] Conferir ícone e splash em iPhone pequeno e grande, sem recorte.
- [ ] Testar Dynamic Type nos tamanhos padrão, grande e de acessibilidade.
- [ ] Validar contraste com o medidor de acessibilidade do iOS.
- [ ] Testar VoiceOver em Home, Swipe, resultado e modal de confirmação.
- [ ] Confirmar permissões limitada, total e negada com uma biblioteca real.
- [ ] Verificar foto, vídeo, undo, adiar, cancelar e remoção em “Apagados Recentemente”.

O gate de dispositivo depende de CG-12. Esta pendência não invalida a revisão estática, mas impede
declarar o gate da Semana 0 como **GO**.
