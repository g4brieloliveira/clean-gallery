# Kleen — Manual da marca

Versão 1.0 · 15 de novembro de 2026  
Produto: **Kleen — Swipe Photo Cleaner**  
Assinatura: **Your photos. Your choice.**

Este documento é a fonte de verdade visual e verbal da Kleen. Novas telas, materiais de loja e implementações feitas por agentes devem seguir estas regras.

---

## 1. Fundamentos

### Propósito

Devolver controle sobre uma fototeca acumulada, transformando uma tarefa cansativa em decisões pequenas, seguras e satisfatórias.

### Promessa

> **Your photos. Your choice.**

Kleen não decide silenciosamente o que apagar. O usuário revisa, escolhe e confirma.

### Posicionamento

Kleen é um organizador privado e local de fotos e vídeos que ajuda pessoas a revisar a biblioteca com rapidez, sem abrir mão de controle e segurança.

### Diferenciais

1. **Controle explícito:** nada é removido sem seleção e confirmação.
2. **Privacidade local:** a galeria não é enviada para um servidor.
3. **Ritmo simples:** uma mídia e uma decisão por vez.
4. **Comunicação honesta:** no iOS, itens vão normalmente para “Apagados Recentemente”; não prometemos espaço liberado imediatamente.

### Personalidade

- Calma, não ansiosa.
- Precisa, não técnica demais.
- Moderna, não futurista.
- Humana, não infantil.
- Confiante, não agressiva.

---

## 2. Nome e arquitetura verbal

### Nome principal

**Kleen**

Pronúncia desejada: “clean” (`kliːn`).

### Nome na loja

**Kleen: Swipe Photo Cleaner**

O nome Kleen constrói a marca; “Swipe Photo Cleaner” explica a categoria e ajuda descoberta na loja.

### Assinaturas aprovadas

| Contexto | Inglês | PT-BR |
|---|---|---|
| Marca | Your photos. Your choice. | Suas fotos. Suas escolhas. |
| Privacidade | Private by design. | Privacidade desde o início. |
| Processamento | Photos stay on your device. | Suas fotos ficam no aparelho. |
| Entrada rápida | Ready for a quick clean? | Que tal uma limpeza rápida? |
| Conclusão | All done. | Tudo pronto. |

### Vocabulário de produto

Usar:

- **Keep / Manter**
- **Remove / Remover**
- **Later / Ver depois**
- **Undo / Desfazer**
- **Review / Revisar**
- **Recently Deleted / Apagados Recentemente**

Evitar:

- “Apagar permanentemente” para a ação padrão no iOS.
- “Libere X GB agora” sem cálculo confiável.
- “IA escolheu”, “limpeza automática” ou linguagem que retire o controle do usuário.
- “Lixo”, “fotos ruins” ou julgamentos sobre memórias pessoais.

---

## 3. Logotipo

### Conceito

O símbolo combina:

1. Dois cartões de fotografia sobrepostos.
2. Um caminho diagonal de swipe.
3. A letra **K** formada por espaço negativo.

O símbolo comunica fotografia e decisão sem recorrer a lixeira, vassoura, robô ou brilho de “IA mágica”.

### Composições

- **App icon:** símbolo sem wordmark.
- **Splash/loading:** símbolo centralizado; wordmark opcional abaixo.
- **Cabeçalho:** símbolo de 28–32 pt + wordmark Kleen.
- **Materiais horizontais:** símbolo à esquerda + wordmark.

### Área de proteção

Use como área livre mínima o equivalente a **25% da largura do símbolo** em todos os lados.

### Tamanho mínimo

- Digital, símbolo: **24 px**.
- Cabeçalho mobile: **28 pt**.
- App icon: usar master de **1024 × 1024 px**.

### Usos incorretos

Não:

- Distorcer, inclinar ou alterar proporções.
- Aplicar gradiente, glow ou sombra decorativa.
- Trocar o fundo índigo por verde ou coral.
- Inserir texto dentro do app icon.
- Substituir os cartões por lixeira ou vassoura.
- Usar o símbolo sobre fotografia sem contraste suficiente.

Fonte vetorial: `assets/brand/kleen-mark.svg`.

---

## 4. Paleta

### Cores de marca

| Token | Hex | Papel |
|---|---:|---|
| `ink` | `#0D0D12` | Fundo profundo / splash |
| `background` | `#121219` | Fundo principal |
| `surface` | `#1B1B24` | Superfícies e controles neutros |
| `surfaceRaised` | `#252532` | Superfícies elevadas |
| `brandPrimary` | `#5142C7` | CTAs, foco e marca |
| `brandPressed` | `#4335AA` | Estado pressionado |
| `brandSoft` | `#B9B2FF` | Detalhes e ilustração |
| `textPrimary` | `#F8F7FC` | Texto principal |
| `textSecondary` | `#AAA8B6` | Texto secundário |
| `textMuted` | `#777583` | Legendas e metadados |

### Cores semânticas

| Token | Hex | Uso exclusivo |
|---|---:|---|
| `keep` | `#53C987` | Manter mídia |
| `keepSoft` | `#183A2A` | Fundo discreto da ação manter |
| `remove` | `#FF6B6B` | Remover mídia / confirmação destrutiva |
| `removeSoft` | `#3C2026` | Fundo discreto da ação remover |

**Regra:** verde e coral não são cores decorativas. Não usar em marca, tabs, chips ativos, busca ou CTAs neutros.

---

## 5. Tipografia

Usar a fonte do sistema Apple (`System` / SF Pro no iOS). Não adicionar uma fonte externa na primeira versão.

| Estilo | Tamanho | Peso | Uso |
|---|---:|---:|---|
| Display | 32 | 700 | Promessas e estados finais |
| Title | 26 | 700 | Título de tela |
| Section | 20 | 700 | Seções |
| Body | 16 | 400–600 | Conteúdo e botões |
| Caption | 13 | 400–600 | Metadados |
| Micro | 11 | 500 | Progresso compacto |

Regras:

- Frases curtas.
- Preferir sentence case.
- Não usar caixa alta em CTAs.
- Suportar Dynamic Type sempre que o layout permitir.
- Usar no máximo três pesos na mesma tela.

---

## 6. Forma, espaçamento e elevação

### Espaçamento

Base de **4 pt**, com uso preferencial de 8, 12, 16, 20, 24 e 32.

- Margem de tela: 20–24 pt.
- Espaço entre seções: 24–32 pt.
- Área de toque mínima: 44 × 44 pt.

### Raios

| Elemento | Raio |
|---|---:|
| Botão / input | 12–16 |
| Card compacto | 16 |
| Foto / card principal | 24–28 |
| Botão circular | 999 |

### Elevação

Evitar sombras fortes. Separar níveis por:

- pequenas diferenças de superfície;
- bordas neutras com baixa opacidade;
- espaço;
- escala tipográfica.

---

## 7. Fotografia e iconografia

### Fotografia

- A mídia do usuário é o elemento principal.
- Na tela de swipe, reservar aproximadamente **60–70%** da área útil para a foto/vídeo.
- Não aplicar filtros decorativos à mídia.
- Não cobrir rostos ou conteúdo importante com badges.

### Ícones

- Usar Ionicons outline de 20–24 pt para ações secundárias.
- Manter/remover usam `checkmark` e `close`, não coração e lixeira.
- Lixeira pode aparecer apenas onde a semântica do sistema exigir, nunca como símbolo da marca.

---

## 8. Motion

- Transições: **180–240 ms**.
- Easing suave, sem overshoot exagerado.
- Swipe acompanha o gesto e retorna com física natural.
- Loading da marca: cartões podem deslocar-se poucos pixels em sentidos opostos; o K permanece estável.
- Respeitar “Reduce Motion”: substituir animação por opacity discreta.
- Não usar confete, streak animation ou gamificação na primeira versão.

---

## 9. Aplicações no produto

### Splash e loading

- Fundo `ink`.
- Símbolo centralizado, ocupando no máximo 24% da largura.
- Sem spinner sobre o símbolo.
- Em loading interno, usar símbolo reduzido + texto específico, por exemplo “Preparando suas fotos…”.
- Nunca simular progresso percentual desconhecido.

### Onboarding

Máximo de 3–4 etapas:

1. **Your photos. Your choice.**
2. Privacidade e processamento local.
3. Gestos + botões alternativos.
4. “Apagados Recentemente” e confirmação.

### Home / biblioteca

- Cabeçalho Kleen pequeno.
- Headline: “Que tal uma limpeza rápida?”
- Quick swipe destacado com `brandPrimary`.
- Álbuns e filtros abaixo, sem excesso de cards.
- Busca e ordenação continuam disponíveis, mas são secundárias.

### Swipe

- Cabeçalho compacto: álbum + `1 de 12`.
- Foto como hero.
- `×` coral à esquerda, `✓` verde à direita.
- Undo e Later como ações secundárias.
- Contagem discreta, sem dashboard.

### Resultado

- Headline: “Tudo pronto”.
- Mostrar revisadas, mantidas e prontas para remover.
- Explicar destino em “Apagados Recentemente”.
- Coral somente na confirmação destrutiva final.

### Paywall futuro

- Usar a marca índigo.
- Não usar urgência falsa.
- Preço e período vindos da loja.
- O paywall nunca interrompe uma exclusão já selecionada.

---

## 10. Voz e tom

### Princípios

1. **Claro:** diga o que vai acontecer.
2. **Curto:** uma ideia por bloco.
3. **Respeitoso:** fotos são memórias, não “lixo”.
4. **Honesto:** comunique limites e estados parciais.

### Exemplos

| Situação | Recomendado | Evitar |
|---|---|---|
| Empty state | “Nada para revisar aqui.” | “Sua galeria está limpa!” se a fonte foi parcial |
| Exclusão | “Mover 8 itens para Apagados Recentemente?” | “Apagar permanentemente?” |
| Falha | “Não foi possível remover 2 itens. Tente novamente.” | “Erro desconhecido.” |
| Loading | “Preparando suas fotos…” | “Otimizando com IA…” |
| Resultado | “12 revisadas · 8 mantidas · 4 prontas para remover” | “Você liberou 2 GB” sem dados |

---

## 11. Acessibilidade

- Contraste mínimo WCAG AA para textos.
- Não depender só de cor: ícone + label + posição consistente.
- Swipe nunca é o único caminho.
- Botões com `accessibilityRole` e labels descritivas.
- Ordem de foco acompanha a leitura.
- Imagens do usuário não precisam de descrição automática invasiva; anunciar posição e tipo quando útil.

---

## 12. Checklist para agentes

Antes de entregar uma tela:

- [ ] A fotografia é protagonista quando aplicável.
- [ ] `brandPrimary` é a cor de navegação/CTA neutro.
- [ ] Verde/coral aparecem somente em manter/remover.
- [ ] Não há lixeira, vassoura ou sparkle como marca.
- [ ] Textos não prometem exclusão permanente nem espaço imediato.
- [ ] Existe alternativa aos gestos.
- [ ] Área de toque mínima de 44 pt.
- [ ] Typecheck e testes passam.
- [ ] Mudança não altera invariantes de exclusão sem ticket específico.

