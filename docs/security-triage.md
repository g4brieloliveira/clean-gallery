# Triagem de segurança de dependências (CG-20)

Data: 2026-11-15  
Gerenciador: npm  
Restrição: **não** aplicar `npm audit fix --force` que puxe Expo major fora do SDK 54.

## Método

1. `npm audit` / `npm audit --omit=dev`
2. Classificar por severidade e se o pacote roda no app mobile em produção vs só toolchain (Metro, Jest, Expo CLI).
3. Mitigar só dentro da compatibilidade do Expo 54.

## Resumo

| Severidade | Observação |
|---|---|
| Crítica / alta em árvore Expo CLI / jest / babel | Em geral **toolchain de build/dev**, não caminho de runtime do app no aparelho |
| `query-string` / `@react-navigation/core` | Dependência de navegação; decode DoS em query strings — risco baixo no uso in-app (sem parsing hostil de deep links externos neste momento) |
| `deepmerge` via `@expo/config` | Build-time; `audit fix --force` tentaria Expo 58 — **recusado** |

## Ações

| Ação | Status |
|---|---|
| Patches Expo alinhados (`expo`, `expo-font`) via `expo install` | Feito (CG-19) |
| `npm audit fix` (sem `--force`) | Tentativa intermediária puxou árvore Expo 58 aninhada; **revertida** com reinstall limpo. Evitar até haver fix seguro no SDK 54 |
| Aceitar residual em toolchain Expo 54 | Documentado até upgrade de SDK planejado |
| Reavaliar antes do build de produção (Semana 5) | Pendente |

## Política para agentes

- **Proibido:** `npm audit fix --force` sem aprovação humana.
- **Obrigatório:** após qualquer mudança de deps, `npm run typecheck && npm run test && npm run doctor`.
- Críticas **alcançáveis em runtime mobile** sem mitigação = bloqueio do gate CG-25.

## Conclusão atual (baseline)

Nenhuma vulnerabilidade crítica claramente alcançável no runtime do app mobile foi confirmada nesta passagem. Residuais concentrados em toolchain Expo/Jest/Babel. Aceite temporário com reavaliação no candidato de release.
