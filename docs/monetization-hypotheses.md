# Hipóteses de monetização — pré-Apple

Status: **hipóteses para teste**, não preços ou limites finais.

## Decisão de implementação

Antes de pagar o Apple Developer Program, o app usa adapters `fake` para
Premium e rewarded ads. Isso permite testar domínio, persistência, gate e UX no
Expo Go. Nenhuma compra é cobrada e nenhum anúncio real é servido.

Depois da conta Apple:

1. substituir `PremiumProvider` por RevenueCat;
2. substituir `RewardedAdProvider` pelo SDK escolhido;
3. manter as mesmas interfaces e suíte;
4. validar tudo em build nativo/Sandbox antes de disponibilizar.

## Hipóteses iniciais

| Item | Hipótese |
|---|---|
| Limite gratuito | 100 decisões líquidas por dia |
| O que consome | `keep` ou `delete` confirmado no swipe |
| Undo | devolve 1 revisão (não houve progresso líquido) |
| Skip/falha/defer | não consome |
| Rewarded ad | +25 revisões após callback `completed` |
| Teto de ads | 2 por dia (+50 no máximo) |
| Pro | revisões sem limite; não mostra gate de anúncio |
| Delete pendente | confirmação/remoção permanece acessível mesmo sem quota |

## Regra de dia e persistência (CG-80)

- Dia local do aparelho (`YYYY-MM-DD`), atualizado ao consultar/consumir quota.
- Virada do dia zera uso, bônus e contagem de anúncios.
- Reiniciar o app preserva o ledger via AsyncStorage.
- Reinstalação limpa o armazenamento local e, nesta fase, reseta o limite. Não
  haverá antifraude complexo.
- Offline: quota local continua funcionando; não inventa entitlement Premium.
  Reward real dependerá de anúncio carregado; falha/cancelamento nunca credita.

## Segurança do gate (CG-77)

O limite bloqueia apenas novas decisões de review. Ele **não bloqueia**:

- abrir “Para remover”;
- revisar o conjunto pendente;
- abrir a confirmação nativa;
- concluir remoções já selecionadas.

## Critérios para revisar as hipóteses

Usar o beta técnico para avaliar:

- sessões iniciadas/concluídas;
- distribuição de reviews por sessão/dia;
- abandono no gate;
- interesse declarado em Pro;
- confiança no anúncio opcional.

Não alterar números apenas para maximizar anúncios antes de validar confiança.
