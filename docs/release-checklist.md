# Checklist de release — Clean Gallery

Aprovador padrão dos gates: **Gabriel Oliveira** (ajustar se mudar o owner).

Fonte: `PLANO_LANCAMENTO.md` + Epics CG-2…CG-7.

## Como usar

1. Só avance de fase com **GO** no gate correspondente.
2. Anexe evidências (links de build, logs de teste, URLs).
3. Assine com nome + data no final de cada seção.

---

## Semana 0 — Baseline (Epic CG-2 · Gate CG-25)

| Evidência | OK? | Nota |
|---|---|---|
| Remoto git configurado (CG-16) | [ ] | |
| Um único lockfile / npm (CG-10, CG-17) | [ ] | |
| Scripts `typecheck` / `test` / `doctor` (CG-18) | [ ] | |
| expo-doctor alinhado ou exceções (CG-19) | [ ] | |
| Triagem de segurança (CG-20) | [ ] | |
| Identidade + `eas.json` (CG-8, CG-21) | [ ] | |
| Permissões revisadas (CG-22) | [ ] | |
| README fiel ao código (CG-23) | [ ] | |

- **GO:** build reproduzível, ferramentas verdes ou exceções registradas, permissões revisadas, remoto ok.
- **NO-GO:** dois lockfiles, build não reproduzível, identidade provisória, crítica sem triagem.

Decisão: _____________ Data: _____________ Aprovador: _____________

---

## Semana 1 — Fluxo destrutivo (Epic CG-3 · Gate CG-45)

| Evidência | OK? | Nota |
|---|---|---|
| P0 CG-26…CG-33 fechados | [ ] | |
| Suite automatizada CG-37…CG-44 verde | [ ] | |
| Revisão manual das invariantes de exclusão | [ ] | |

- **GO:** testes P0 passam + invariantes confirmadas.
- **NO-GO:** inconsistência seleção/confirmação/histórico/fila/biblioteca.

Decisão: _____________ Data: _____________ Aprovador: _____________

---

## Semana 2 — Device / permissão (Epic CG-4 · Gate CG-63)

| Evidência | OK? | Nota |
|---|---|---|
| Corpus device (CG-9, CG-46) | [ ] | |
| Matriz de permissão (CG-47, CG-48) | [ ] | |
| Suíte manual CG-56…CG-62 | [ ] | |
| Zero P0 aberto | [ ] | |

- **GO:** suíte manual em aparelho real sem P0.
- **NO-GO:** crash, exclusão divergente, cross-session, permissão ambígua.

Decisão: _____________ Data: _____________ Aprovador: _____________

---

## Semana 3 — Beta técnico (Epic CG-5 · Gate CG-72)

| Evidência | OK? | Nota |
|---|---|---|
| TestFlight + legal (CG-64, CG-65) | [ ] | |
| Feedback classificado (CG-71) | [ ] | |
| Zero exclusão incorreta | [ ] | |
| Decisão sobre Pro | [ ] | |

- **GO:** segurança confirmada + principais problemas corrigidos com regressão.
- **NO-GO:** integridade, desconfiança recorrente, desempenho sem diagnóstico.

Decisão: _____________ Data: _____________ Aprovador: _____________

---

## Semana 4 — Monetização (Epic CG-6 · Gate CG-92)

| Evidência | OK? | Nota |
|---|---|---|
| Label + política (CG-73, CG-74) | [ ] | |
| Matriz Sandbox nativa (CG-79, CG-86…CG-91) | [ ] | |
| Paywall não bloqueia exclusão pendente (CG-77) | [ ] | |

- **GO:** Sandbox completa, docs coerentes, oferta clara.
- **NO-GO:** restore inconsistente, privacidade indefinida, preço enganoso, só Expo Go.

Decisão: _____________ Data: _____________ Aprovador: _____________

---

## Semana 5 — Submissão (Epic CG-7 · Gate CG-102)

| Evidência | OK? | Nota |
|---|---|---|
| Build produção = commit identificado (CG-93) | [ ] | |
| Regressão no mesmo build (CG-97) | [ ] | |
| Metadados ASC / screenshots honestos (CG-94, CG-98, CG-99) | [ ] | |
| Review notes + FAQ (CG-96, CG-100) | [ ] | |
| Plano de rollback/comunicação | [ ] | |

- **GO:** candidato reproduzível, regressão verde, docs consistentes.
- **NO-GO:** mudança pós-candidato, P0/P1 crítico, divergência de privacidade.

Decisão: _____________ Data: _____________ Aprovador: _____________
