# Regras do programa — 2026

Páginas 3 a 7. São as regras que valem **acima** dos critérios individuais.

## Conceito (p3)

- Duração de **um ano, exclusivamente 2026**. A Nestlé reserva o direito de fazer
  ajustes durante o período.
- Dois capítulos: **Performance** e **Excelência Operacional**.
- Reconhecimento: melhor BROKER do Brasil (anual) + **três melhores por
  trimestre**.

## Participação (p4)

Todos os Brokers podem participar, desde que em dia com as obrigações contratuais
e desejem aderir. É obrigatório assinar o **Termo de Participação via DocuSign**.

## Modelo de pontuação + booster de OG (p4)

Verbatim: *"Em 2026 o livro será avaliado com base na relação entre **pontos
possíveis versus pontos realizados**. Além disso, passa a existir um **booster em
pontos atrelado ao crescimento de OG (NNS NIM - BRL1, BRP2, BRN2 e BRN8)** do
Broker, que será somado ao realizado total para o cálculo da **aderência
trimestral**."*

Faixas do booster, **exatamente como impressas** (note os dois itens "2 -"):

```
1 - Crescimento abaixo de 7%   = 0 pts
2 - de 7,01% a 9,9%            = 100 pts
2 - de 10% a 14,9%             = 150 pts
3 - de 15% a 19,9%             = 200 pts
4 - acima de 20%               = 300 pts
```

**Buracos nas faixas** — o livro não diz o que acontece nestes valores:
- exatamente **7,00%** (entre "abaixo de 7%" e "de 7,01%")
- entre **9,9% e 10%**
- entre **19,9% e 20%**

Não feche esses buracos por conta própria: pergunte ao dono do produto.

## Regras de elegibilidade e compliance (p4)

O descumprimento **anula a pontuação total da avaliação no trimestre** em que a
penalidade for identificada:

> **I.** Realizar práticas que violem os princípios, valores, normas e sistemas
> da Nestlé, com o intuito de manipular resultados ou omissão de dados.
>
> **II.** Envolver-se em litígios judiciais contra a Nestlé.
>
> **III.** Para o Broker ser elegível a premiação trimestral e anual, o Broker
> precisa atingir pelo menos **80% da pontuação total dos itens compliance**, com
> a possibilidade de recuperar pontos ao longo do ano.
>
> **IV.** No acumulado do ano, caso o Broker não alcance o mínimo de **80%** da
> pontuação nos itens de compliance, será classificado como **1/1 na Matriz de
> Meritocracia**.

E de p3: é fundamental atingir **no mínimo 80% de conformidade** com as regras de
compliance ao longo do ano, para evitar a **desclassificação do programa**.

### Os três 80% não são a mesma coisa

Cuidado ao modelar — o livro usa "80%" em três sentidos:
1. **80% de conformidade** ao longo do ano → evita desclassificação (p3).
2. **80% da pontuação total dos itens de compliance** → elegibilidade a prêmio
   trimestral/anual, **recuperável ao longo do ano** (p4, III).
3. **80% no acumulado do ano** → abaixo disso, 1/1 na Matriz (p4, IV).

## Matriz de Meritocracia — **não definida**

Citada **uma única vez em todo o PDF** (p4, regra IV), apenas para dizer que
abaixo de 80% em compliance o Broker é classificado como **1/1**. A matriz **não
é tabulada, definida nem diagramada em lugar nenhum** do livro. Qualquer
implementação depende de fonte externa — pergunte antes de modelar.

## Critérios de desempate (p5)

O texto anuncia *"quatro critérios"* mas **lista apenas três** — defeito da fonte:

| # | Critério | Bônus de desempate |
|---|---|---|
| 1 | **Performance VBC** — melhor desempenho acumulado | **+0,100%** |
| 2 | **Cobertura de clientes** — melhor acumulado | **+0,050%** |
| 3 | **Percentual de itens de Compliance** — melhor cumprimento | **+0,050%** |

## Campeões históricos (p6)

Lista de campeões de **2004 a 2025** (GLOBO SALVADOR 2004 … MANÁ MARINGÁ 2025).
Sem regras; é conteúdo institucional.

## Totais por capítulo (p7)

| Capítulo | Total impresso | Soma dos critérios |
|---|---|---|
| I — PERFORMANCE | **1.600 pts** | não derivável (ver abaixo) |
| II — EXCELÊNCIA OPERACIONAL | **400 pts** | **232,0** |
| 2.10 — Itens de Compliance | (dentro dos 400) | **62,0** |

**A conta não fecha e o livro não a mostra.** Os critérios do Capítulo II somam
232; com compliance, 294 — contra os 400 impressos. Em Performance, os pontos são
mensais e por organização/categoria (1.1.1 soma 138+20; 1.1.2 soma 136+40,5;
1.4.1 e 1.4.2 pagam por organização), o que plausivelmente explica um total anual
de 1.600, mas **a regra de conversão não está escrita em lugar nenhum**.

Esta é a lacuna mais importante do livro: sem ela **não há como calcular a
aderência trimestral fielmente**. É pergunta obrigatória ao dono do produto antes
de implementar qualquer cálculo de pontuação agregada.
