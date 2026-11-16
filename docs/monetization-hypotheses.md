# Hipóteses de monetização — pré-Apple

Status: **hipóteses para teste**, não preços ou limites finais.

## Decisão de implementação

Premium já usa RevenueCat (`react-native-purchases` + Paywalls UI) com a chave
de Test Store. Compras reais exigem development build + App Store Connect /
Sandbox. Rewarded ads continuam no adapter `fake` até o SDK nativo.

Checklist RevenueCat: ver `docs/REVENUECAT.md`.

## Hipóteses iniciais

| Item | Hipótese |
|---|---|
| Limite gratuito | 50 decisões líquidas por dia |
| O que consome | `keep` ou `delete` confirmado no swipe |
| Undo | devolve 1 revisão (não houve progresso líquido) |
| Skip/falha/defer | não consome |
| Rewarded ad | +25 revisões após callback `completed` |
| Teto de ads | Sem teto diário; cada conclusão libera +25 |
| Pro | revisões sem limite; não mostra gate de anúncio |
| Delete pendente | confirmação/remoção permanece acessível mesmo sem quota |

### Hipótese de oferta e preço

- Uma assinatura mensal simples é a primeira oferta a testar.
- Faixa exploratória: **R$ 9,90 a R$ 19,90/mês**, sem preço escolhido.
- Uma opção anual só deve entrar após validar retenção e intenção de compra.
- O teste deve usar preços localizados da App Store; nenhum valor será exibido
  como final antes de o produto existir no App Store Connect.
- “Restaurar compras” e “Gerenciar assinatura” devem estar disponíveis sem
  login próprio. O entitlement será ligado ao Apple ID.

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

- abrir e navegar pelos álbuns virtuais “Aprovadas” e “Para remover”;
- visualizar esses álbuns em grade paginada;
- reclassificar itens dentro dos álbuns virtuais;
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
