# Plano de lançamento: Kleen

## Objetivo e regra de execução

Lançar primeiro no iOS um app confiável para revisar fotos e vídeos com gestos, confirmar exclusões e manter decisões entre sessões. Monetização e retenção só entram depois de o fluxo destrutivo passar pelos gates de segurança.

As semanas abaixo representam uma cadência indicativa, não uma promessa de data. Uma fase só avança quando seus critérios de aceite e seu gate **go/no-go** forem atendidos. Item incompleto de P0 bloqueia o lançamento; item P1 pode bloquear conforme o risco observado; item P2 é candidato explícito a corte.

### Prioridades

- **P0 — bloqueador:** segurança dos dados, consistência do estado, permissões, privacidade, build e conformidade de loja.
- **P1 — necessário para uma primeira versão de qualidade:** clareza de valor, observabilidade mínima, experiência de permissão, beta e operação.
- **P2 — desejável:** otimizações de conversão, retenção e acabamento que não devem atrasar a validação segura.

## Estado atual verificado

### O que já existe

- Seleção de álbum com busca, filtros, ordenação e modos lista/grade.
- Sessões por álbum, por mídias aprovadas e em modo aleatório.
- Swipe para marcar exclusão ou manter; exclusão fica pendente até confirmação.
- Desfazer antes da conclusão, adiar a mídia atual e persistir IDs marcados como “manter”.
- Suporte a fotos e vídeos, preview, cache LRU, resolução de URIs do iOS e prefetch.
- Carregamento inicial e paginação em segundo plano para reduzir o tempo de abertura.
- TypeScript válido em `npx tsc --noEmit`.

### Bloqueadores e riscos conhecidos

- Não há testes automatizados nem script `test`.
- Após uma exclusão no meio da sessão, a fila é alterada, mas o histórico permanece; “desfazer” pode operar sobre um estado inválido.
- A paginação não possui token ou cancelamento por sessão; uma carga antiga pode inserir mídias em uma sessão nova.
- Um álbum pode ser marcado como validado antes do fim da paginação ou apesar do limite de carregamento.
- O texto “Apagar permanentemente” é inexato no iOS: normalmente os itens vão para “Apagados Recentemente” e o espaço pode não ser liberado imediatamente.
- IDs apagados podem continuar persistidos na lista de aprovados.
- A hidratação do estado persistido não bloqueia o início da experiência.
- O acesso limitado à fototeca do iOS não possui tratamento ou explicação específicos.
- O modo aleatório embaralha lotes, começando pelos itens mais recentes; não é uma amostragem global perfeitamente aleatória.
- Contagens somadas entre álbuns podem duplicar mídias presentes em mais de um álbum.
- O Android ainda solicita `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE`.
- Faltam `eas.json`, `ios.bundleIdentifier`, `android.package`, nome final e configuração de build.
- Existem `package-lock.json` e `yarn.lock`; o EAS pode inferir o gerenciador errado.
- `expo-doctor` apontou patches esperados mais recentes para `expo` e `expo-font`.
- A auditoria de dependências encontrou vulnerabilidades transitivas, inclusive altas e críticas; elas precisam de triagem, sem aplicar atualização forçada que quebre o SDK.
- O trabalho atual ainda precisa ser organizado em commits e conectado a um remoto.
- O README descreve o modo aleatório de forma diferente da implementação.

## Decisões de produto ainda válidas

| Tema | Direção |
|---|---|
| Plataforma | iOS primeiro; Android somente após estabilidade e revisão das políticas de acesso a fotos. |
| Posicionamento | Privacidade local, rapidez e resultado claro; não prometer liberação imediata de espaço no iOS. |
| Nome | Escolher nome próprio e pesquisável antes de configurar IDs e materiais da loja. |
| Monetização | Avaliar grátis com limite de uso + Pro, sem fixar preço antes do beta e dos testes de oferta. |
| Compras | RevenueCat é a opção inicial, condicionada à revisão de privacidade, build nativo e testes Sandbox. |
| Recurso Pro | Preferir valor diretamente observável, como filtros por tipo ou tamanho, sem começar por detecção de duplicatas. |
| Dados | Sem upload da galeria. Toda afirmação de “não coleta dados” deve considerar SDKs de compra, diagnóstico e analytics. |

## Dependências externas e decisões pendentes

- [ ] Conta ativa no Apple Developer Program e acesso ao App Store Connect.
- [ ] Nome final, `bundleIdentifier`, SKU e proprietário dos certificados.
- [ ] Dispositivo iOS real com biblioteca controlada, itens no iCloud, fotos, vídeos e mais de 10 mil mídias.
- [ ] Escolha de npm **ou** Yarn como único gerenciador.
- [ ] Decisão sobre analytics: nenhuma telemetria, métricas agregadas da loja ou SDK com consentimento e declaração.
- [ ] Conta e projeto no RevenueCat, somente para a fase de monetização.
- [ ] URL pública para política de privacidade, suporte e termos aplicáveis.
- [ ] Definição da oferta Pro, limite gratuito e preços a testar; nenhum valor é compromisso até validação.

## Semana 0 — Baseline, governança e reprodutibilidade

### P0

- [ ] Organizar o trabalho em commits pequenos e configurar o remoto.
- [ ] Escolher um gerenciador e manter apenas seu lockfile.
- [ ] Adicionar scripts padronizados para typecheck, testes e validação do Expo.
- [ ] Alinhar dependências aos patches compatíveis indicados por `expo-doctor`.
- [ ] Triar o relatório de segurança por alcançabilidade e impacto; atualizar apenas dentro da compatibilidade do Expo.
- [ ] Definir nome, IDs das plataformas e perfis de desenvolvimento/preview/produção no `eas.json`.
- [ ] Remover permissões Android legadas e revisar as permissões geradas pelo plugin.

### P1

- [ ] Atualizar o README para refletir paginação, limites e comportamento real do modo aleatório.
- [ ] Criar checklist versionado de release e registrar quem aprova cada gate.

### Critérios de aceite

- Instalação limpa reproduzível com um único gerenciador.
- `typecheck`, testes e `expo-doctor` executáveis por comando documentado.
- Build de desenvolvimento iOS instalável em aparelho real.
- Nenhuma vulnerabilidade crítica alcançável sem mitigação documentada.
- Identidade do app consistente entre configuração, build e App Store Connect.

### Gate go/no-go

- **GO:** build reproduzível, ferramentas verdes ou exceções registradas, permissões revisadas e remoto configurado.
- **NO-GO:** dois lockfiles, build não reproduzível, identidade provisória ou vulnerabilidade crítica sem triagem.

## Semana 1 — Segurança do fluxo destrutivo

### P0

- [ ] Corrigir o histórico após exclusão confirmada: limpar ou reconstruir entradas para que “desfazer” nunca referencie mídia removida.
- [ ] Adicionar identidade/token de sessão à paginação e ignorar resultados de sessões antigas.
- [ ] Representar explicitamente os estados `carregando`, `paginação concluída`, `parcial por limite`, `cancelado` e `falhou`.
- [ ] Marcar álbum como validado somente quando toda a fonte prevista for processada; não tratar limite técnico como conclusão.
- [ ] Remover IDs apagados de `keptAssetIds` e reconciliar ativos que deixaram de existir.
- [ ] Impedir interação dependente de persistência antes da hidratação do Zustand.
- [ ] Corrigir os textos de exclusão: explicar “Apagados Recentemente”, ausência de recuperação pelo app e liberação não imediata de espaço.
- [ ] Definir o comportamento em falha parcial ou cancelamento do diálogo nativo de exclusão.

### P1

- [ ] Informar quando a sessão cobre apenas parte de um álbum devido a limite.
- [ ] Exibir quantidade apagada e mantida ao concluir; não mostrar GB sem cálculo confiável.
- [ ] Registrar erros técnicos localmente de modo não sensível durante o beta.

### Testes automatizados obrigatórios

- [ ] `galleryStore`: manter, apagar, desfazer, adiar e iniciar nova sessão.
- [ ] Exclusão no meio da sessão seguida de desfazer.
- [ ] Falha e sucesso parcial na exclusão.
- [ ] Paginação antiga após troca rápida de álbum.
- [ ] Conclusão enquanto ainda existe paginação.
- [ ] Álbum maior que o limite técnico.
- [ ] Hidratação com IDs mantidos, apagados e inexistentes.
- [ ] Duplicação de lotes e chamadas repetidas.

### Critérios de aceite

- Nenhuma sequência testada faz o app apagar item não selecionado.
- Uma sessão nunca recebe item de outra sessão.
- “Desfazer” permanece correto ou fica indisponível após confirmação, conforme decisão documentada.
- Álbum parcial não aparece como totalmente validado.
- Mensagens do iOS não afirmam exclusão permanente nem liberação imediata.
- Testes do store e serviço passam de forma determinística.

### Gate go/no-go

- **GO:** todos os testes P0 passam e uma revisão manual confirma as invariantes de exclusão.
- **NO-GO:** qualquer inconsistência entre seleção, confirmação, histórico, fila e biblioteca real.

## Semana 2 — Compatibilidade real, permissão e experiência mínima

### P0

- [ ] Testar em iPhone real com fotos locais, vídeos, itens somente no iCloud e biblioteca com mais de 10 mil itens.
- [ ] Testar permissão total, limitada, negada e revogada durante o uso.
- [ ] Oferecer caminho claro para configurações e explicar quando apenas parte da biblioteca está disponível.
- [ ] Validar interrupção, background/foreground, pouca memória e rede indisponível durante download do iCloud.
- [ ] Confirmar o comportamento nativo de “Apagados Recentemente” na versão mínima de iOS suportada.

### P1

- [ ] Melhorar o modo aleatório ou renomeá-lo para não sugerir amostragem global quando houver paginação por lotes.
- [ ] Corrigir contagens que possam somar a mesma mídia em múltiplos álbuns ou rotular a métrica com precisão.
- [ ] Criar onboarding curto: permissão, gestos, processamento local e comportamento da exclusão.
- [ ] Revisar acessibilidade: labels, foco, contraste, Dynamic Type e alternativas aos gestos.
- [ ] Criar resultado de sessão por quantidade; calcular tamanho apenas se os metadados forem confiáveis e o custo aceitável.

### Testes manuais obrigatórios

- [ ] 100 ciclos consecutivos de manter/apagar/desfazer sem divergência.
- [ ] Troca rápida entre pelo menos três álbuns durante paginação.
- [ ] Fotos e vídeos locais e no iCloud, inclusive falhas de download.
- [ ] Biblioteca com 10 mil ou mais itens e álbum acima do limite configurado.
- [ ] Permissão limitada com alteração posterior da seleção permitida.
- [ ] Cancelamento da confirmação nativa e falha de exclusão.
- [ ] Reinício do app antes e depois de uma sessão.

### Critérios de aceite

- Zero perda ou exclusão incorreta no corpus controlado.
- Zero mistura de sessão nos testes de troca rápida.
- Nenhum bloqueio ou loop infinito nos cenários de permissão e iCloud.
- O usuário entende o que será apagado, onde o item ficará no iOS e como voltar às configurações.
- Tempo, memória e taxa de falha são registrados no relatório do beta técnico, sem meta inventada antes da baseline.

### Gate go/no-go

- **GO:** suíte manual concluída em aparelho real, sem incidente P0 aberto.
- **NO-GO:** crash reproduzível, exclusão divergente, conteúdo cruzado entre sessões ou permissão ambígua.

## Semana 3 — Beta técnico sem paywall completo

O objetivo desta fase é validar segurança, compreensão e desempenho sem confundir resultados com fricção comercial.

### P0

- [ ] Distribuir build pelo TestFlight para um grupo pequeno com bibliotecas variadas.
- [ ] Publicar política de privacidade e canal de suporte antes do convite.
- [ ] Explicar no onboarding do beta como relatar incidentes sem enviar fotos pessoais.
- [ ] Congelar mudanças de arquitetura durante o beta; correções P0 recebem novo build e regressão completa.

### P1

- [ ] Recrutar participantes com bibliotecas pequenas, grandes, vídeos e iCloud.
- [ ] Aplicar roteiro de teste e pesquisa curta sobre confiança, clareza e valor.
- [ ] Coletar métricas permitidas pela política definida.
- [ ] Revisar feedback e classificar cada achado como P0/P1/P2.

### Métricas do beta

- Taxa de sessões iniciadas e concluídas.
- Quantidade de ações de manter, apagar, desfazer e adiar.
- Taxa de falha ao exibir mídia e ao confirmar exclusão.
- Incidentes de divergência entre seleção e resultado: meta obrigatória de **zero**.
- Tempo até o primeiro swipe e duração da sessão, usando baseline observada.
- Percentual de participantes que entende “Apagados Recentemente”.
- Intenção de reutilização e interesse no recurso Pro proposto.

Se não houver consentimento ou base adequada para telemetria no app, medir com dados agregados do TestFlight/App Store Connect e pesquisa, sem adicionar SDK.

### Critérios de aceite

- Nenhum incidente de exclusão incorreta.
- Nenhum P0 aberto; P1 possui correção ou decisão explícita antes do lançamento.
- Participantes conseguem explicar corretamente o fluxo de exclusão.
- Existe evidência de valor para ao menos uma proposta Pro; sem evidência, não construir paywall completo.

### Gate go/no-go

- **GO:** segurança confirmada e problemas principais corrigidos com regressão.
- **NO-GO:** qualquer incidente de integridade, feedback recorrente de desconfiança ou desempenho sem diagnóstico.

## Semana 4 — Monetização e privacidade

Esta fase começa somente após o **GO** do beta técnico.

### P0

- [ ] Revisar os dados processados pelo RevenueCat e preencher a etiqueta de privacidade com base na documentação e configuração reais.
- [ ] Atualizar política e termos; não declarar simplesmente “não coleta dados” se SDKs processarem identificadores, compras ou diagnóstico.
- [ ] Criar produtos no App Store Connect e entitlements no RevenueCat.
- [ ] Implementar compra, restauração, expiração, modo offline e tratamento de erro.
- [ ] Garantir que exclusões já selecionadas não sejam bloqueadas por um paywall inesperado.
- [ ] Exibir preço, período, renovação e condições de forma clara.
- [ ] Testar todas as compras em build nativo Sandbox; RevenueCat não deve ser validado apenas no Expo Go.

### P1

- [ ] Implementar limite gratuito simples e compreensível, definindo fuso, virada do dia, reinstalação e funcionamento offline.
- [ ] Selecionar um único recurso Pro validado pelo beta, como filtro por capturas ou vídeos grandes.
- [ ] Testar ofertas e preços em vez de assumir os valores iniciais.

### P2

- [ ] Meta diária, streak e notificação local opcional.
- [ ] Oferta vitalícia, somente se fizer sentido econômico e operacional.
- [ ] Paywall alternativo ou experimentos sofisticados.

### Testes obrigatórios

- [ ] Compra aprovada, cancelada, pendente e com erro.
- [ ] Restaurar compras em nova instalação.
- [ ] Assinatura ativa, expirada, reembolsada e em período de tolerância.
- [ ] Rede indisponível e RevenueCat indisponível.
- [ ] Limite gratuito na virada do dia e após reinício.
- [ ] Acessibilidade, localização de preços e links legais.

### Critérios de aceite

- Entitlement sempre corresponde ao estado da loja nos cenários testados.
- Restaurar compras funciona sem contato com suporte.
- Paywall não impede acesso a direitos comprados nem interrompe exclusão pendente.
- Política, etiqueta de privacidade e comportamento do SDK são coerentes.
- Nenhum dado de foto ou vídeo é enviado ao RevenueCat ou a analytics.

### Gate go/no-go

- **GO:** matriz Sandbox completa, documentos coerentes e oferta compreendida em teste.
- **NO-GO:** restauração inconsistente, privacidade indefinida, preço enganoso ou dependência do Expo Go.

## Semana 5 — Loja, candidato de release e submissão

### P0

- [ ] Gerar build de produção a partir de commit identificado e manter o artefato reproduzível.
- [ ] Preencher privacidade, classificação, suporte e justificativa do acesso à fototeca conforme o comportamento real.
- [ ] Validar assinatura, restauração e links legais no candidato final.
- [ ] Preparar notas para revisão, credenciais ou instruções necessárias e demonstração do fluxo.
- [ ] Executar regressão completa no mesmo build enviado.

### P1

- [ ] Criar screenshots e vídeo fiéis ao produto, sem prometer liberação imediata de espaço.
- [ ] Escrever descrição, palavras-chave e “o que há de novo”.
- [ ] Preparar FAQ sobre “Apagados Recentemente”, privacidade e restauração de compras.
- [ ] Solicitar avaliação via StoreKit somente após uma sessão concluída com resultado positivo.

### Critérios de aceite

- Checklist de release assinado e todos os P0 fechados.
- Build enviado é o mesmo que passou pela regressão.
- Metadados e screenshots correspondem ao funcionamento atual.
- Política e suporte estão acessíveis publicamente.
- Plano de rollback e comunicação está pronto.

### Gate go/no-go

- **GO:** candidato reproduzível, regressão verde e documentação consistente.
- **NO-GO:** mudança não testada após o candidato, P0/P1 crítico aberto ou divergência de privacidade.

O tempo de revisão da Apple é variável. Não assumir prazo fixo nem comprometer uma data pública antes da aprovação.

## Lista explícita de corte

Se qualquer P0 atrasar, cortar nesta ordem sem bloquear o primeiro lançamento:

1. **P2:** streak, metas, notificações e experimentos de paywall.
2. **P2:** vídeos de marketing em volume e calendário diário de publicação.
3. **P2:** oferta vitalícia.
4. **P1:** inglês e outros idiomas; lançar em PT-BR se metadados e público estiverem alinhados.
5. **P1:** cálculo de GB; manter resultado por contagem.
6. **P1:** visualização avançada, filtros adicionais e ordenação por tamanho.
7. **Monetização completa:** se segurança estiver validada, considerar lançamento gratuito controlado antes de apressar compras.

Não cortar testes de exclusão, testes em dispositivo real, restauração de compras quando houver paywall, política de privacidade, suporte ou revisão de permissões.

## Contingência e rollback

### Antes da aprovação

- Rejeição de loja: corrigir apenas a causa documentada, gerar novo candidato e repetir regressão afetada.
- Falha de compra: remover monetização do candidato ou adiar submissão; não liberar paywall sem restauração confiável.
- Incidente de integridade: interromper distribuição do beta e voltar ao último build conhecido como seguro.

### Depois da publicação

- Manter liberação manual ou faseada quando disponível.
- Em crash ou regressão não destrutiva: pausar rollout, preparar hotfix mínimo e comunicar no suporte.
- Em suspeita de exclusão incorreta: pausar imediatamente a distribuição, desabilitar a entrada no fluxo afetado por nova versão e orientar usuários a não esvaziar “Apagados Recentemente”.
- Em falha do RevenueCat: preservar acesso previamente reconhecido quando tecnicamente seguro, evitar bloquear funções básicas e publicar correção.
- Registrar versão, modelo do aparelho, versão do sistema, sequência de ações e resultado; nunca solicitar a foto pessoal como evidência padrão.
- Não depender de rollback binário instantâneo da App Store: a proteção principal é rollout controlado, feature gating quando aplicável e hotfix previamente ensaiado.

## Pós-lançamento

### Primeiras 24–72 horas

- Monitorar crashes, falhas de exibição, suporte, avaliações e compras.
- Verificar restauração, eventos de entitlement e divergências de receita.
- Interromper aquisição paga se houver incidente P0.

### Primeiras semanas

- Revisar semanalmente instalações, sessões concluídas, falhas, conversão, reembolso e retenção.
- Priorizar confiabilidade e clareza antes de aumentar aquisição.
- Testar preço e proposta Pro com uma hipótese por vez.
- Responder feedback e manter FAQ atualizado.

### Android

Somente iniciar submissão quando o iOS estiver estável, os testes de integridade estiverem consolidados e houver revisão específica das políticas do Google Play para acesso a fotos e vídeos. Revalidar permissões por versão do Android e usar o menor escopo possível.

### Recursos futuros

- Detecção de duplicatas, classificação local e análise pesada só entram após evidência de demanda e avaliação de desempenho/privacidade.
- Internacionalização completa entra quando houver canal de suporte e materiais da loja nos idiomas escolhidos.

## Métricas de operação

| Área | Métrica | Sinal de bloqueio ou investigação |
|---|---|---|
| Integridade | Exclusão divergente da seleção | Qualquer ocorrência é P0. |
| Confiabilidade | Crash-free sessions e falhas ao abrir mídia | Regressão relevante contra a baseline. |
| Funil | Permissão concedida → primeiro swipe → sessão concluída | Queda recorrente exige diagnóstico por etapa. |
| Clareza | Entendimento de “Apagados Recentemente” | Feedback recorrente de confusão bloqueia comunicação atual. |
| Valor | Itens revisados/apagados por sessão e retorno | Avaliar distribuição, não apenas média. |
| Monetização | Visualização do paywall, compra, restauração, conversão e reembolso | Restauração falha ou reembolso anormal bloqueia expansão. |
| Suporte | Incidentes por versão e tempo até diagnóstico | Incidente P0 exige pausa do rollout. |

Não definir metas numéricas arbitrárias antes do beta. Registrar a baseline, definir a meta da iteração seguinte e documentar a razão.

## Custos e premissas

- Apple Developer Program, comissão da loja, plano do RevenueCat e regras comerciais devem ser confirmados nas páginas oficiais no momento da contratação.
- Hospedagem de política e suporte pode começar em serviço simples, desde que público e estável.
- Não tratar preços, comissões, gratuidade de SDK ou prazo de revisão como garantias permanentes.

## Definição final de pronto para lançamento

O Kleen está pronto somente quando:

- todos os P0 estão fechados e verificados;
- testes automatizados e manuais obrigatórios passaram;
- não há incidente de exclusão incorreta no beta;
- o build final foi testado em aparelho real com biblioteca grande e iCloud;
- permissões, textos e comportamento de exclusão são coerentes;
- política e etiqueta de privacidade refletem todos os SDKs;
- compras e restauração passaram no Sandbox, se incluídas;
- suporte, contingência e rollout controlado estão preparados;
- o escopo restante está explicitamente classificado como pós-lançamento.
