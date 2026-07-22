---
name: livro-crescer-brokers-2026
description: Fonte da verdade do LIVRO CRESCER + BROKERS 2026 (regulamento oficial Nestlé) — estrutura de capítulos, os 39 critérios com pontos/faixas/prazos, gatilhos de anulação, itens de compliance, anexos e defeitos conhecidos da fonte. Use SEMPRE que a tarefa envolver critérios, pontuação, faixas, metas, prazos, compliance, anexos, numeração de capítulo/seção, o catálogo `criteria` do banco, ou a navegação do programa. Consulte antes de escrever qualquer número — nunca cite pontuação de memória.
---

# Livro CRESCER + BROKERS 2026

Regulamento oficial da Nestlé para avaliar Brokers no ano-calendário de **2026**.
Fonte: `../../../LIVRO CRESCER + 2026 - NIM OFICIAL - V3.pdf` (62 páginas), na
pasta pai do repositório. A plataforma deste repo **não é um sistema da Nestlé**:
é a ferramenta do Grupo Arantes para autogerir, auditar e simular seu desempenho
no programa.

## Regra de ouro

**Nunca cite pontuação, faixa, prazo ou percentual de memória — nem do PRD.**
Todo número vem dos arquivos em `references/`, que foram extraídos do PDF página
a página. O PRD (`PRD-CRESCER-BROKERS-AUDITORIA.md`) é interpretação; o livro é
a fonte. Onde discordarem, o livro vence e a divergência deve ser reportada ao
usuário, não silenciada.

Se um número que você precisa não estiver em `references/`, ele provavelmente
**não existe no livro** — veja "Lacunas reais da fonte" abaixo. Não invente e não
derive: pergunte.

## Onde está cada coisa

| Arquivo | Conteúdo |
|---|---|
| `references/regras-do-programa.md` | Booster OG, elegibilidade, desempate, compliance 80%, Matriz de Meritocracia |
| `references/capitulo-1-performance.md` | Critérios 1.1.1 a 1.5.2, com as tabelas de pontos do VBC |
| `references/capitulo-2-excelencia-operacional.md` | Critérios 2.1.1 a 2.9.3 |
| `references/itens-de-compliance.md` | Critérios 2.11.1 a 2.16.1 |
| `references/anexos.md` | Anexos I a XI — roteiros, passos da venda, kits, check lists, certidões |

## Estrutura oficial

Dois capítulos + um bloco de compliance. Totais **conforme impressos no índice
(página 7)**:

- **CAPÍTULO I — PERFORMANCE: 1.600 pontos.** Seções 1.1 a 1.5, oito critérios.
- **CAPÍTULO II — EXCELÊNCIA OPERACIONAL: 400 pontos.** Seções 2.1 a 2.9
  (24 critérios) + 2.10 Itens de Compliance (7 critérios).
- **ANEXOS:** I a XI.

Contraintuitivo, mas é o que está impresso: Performance tem 5 seções e 1.600
pontos; Excelência tem 10 seções e 400. A multiplicação por organização de venda
e por categoria nos critérios 1.1 e 1.4 explica plausivelmente o total maior de
Performance, mas **o livro não mostra essa conta** — ver "Lacunas reais".

```
CAPÍTULO I - PERFORMANCE .................... 1.600 pts
  1.1 VBC                        1.1.1  1.1.2
  1.2 COBERTURA                  1.2.1            <- sem pontos na V3
  1.3 SORTIMENTO FARMA B         1.3.1
  1.4 BEES                       1.4.1  1.4.2
  1.5 RUPTURA/POSITIVAÇÃO EM ROTA 1.5.1  1.5.2

CAPÍTULO II - EXCELÊNCIA OPERACIONAL ........ 400 pts
  2.1 PESSOAS                    2.1.1  2.1.2
  2.2 PLANEJAMENTO DE VENDAS     2.2.1  2.2.2  2.2.3  2.2.4
  2.3 PROCESSOS DE VENDAS        2.3.1  2.3.2
  2.4 VENDEDOR                   2.4.1  2.4.2  2.4.3  2.4.4
  2.5 PROMOTOR DE VENDAS         2.5.1
  2.6 DESENVOLVIMENTO DA ROTA    2.6.1
  2.7 TI                         2.7.1
  2.8 SUPPLY CHAIN               2.8.1 ... 2.8.6
  2.9 OPERAÇÕES LOGÍSTICAS       2.9.1  2.9.2  2.9.3
  2.10 ITENS DE COMPLIANCE       2.11.1 2.12.1 2.12.2 2.13.1 2.14.1 2.15.1 2.16.1

ANEXOS ...................................... I a XI
```

## A numeração do compliance: defeito da fonte, decisão pendente

**Isto vai gerar discussão com usuários. Leia antes de escrever qualquer código
que numere o compliance.**

O livro é internamente inconsistente:

- O **índice** (p7) chama o bloco de **`2.10 - itens de compliance`**, décima e
  última entrada do Capítulo II.
- **`2.10` aparece uma única vez em todo o PDF** — só ali. Não existe nenhum
  critério `2.10.x`, nem nenhuma página com cabeçalho 2.10.
- O **corpo** (p43-49) traz o cabeçalho **`2.11 - COMPLIANCE`** em *todas* as
  sete páginas, inclusive nas dos critérios 2.12 a 2.16 — é artefato de template,
  copiado e colado, não uma renumeração real.
- Os **critérios** são numerados **2.11.1, 2.12.1, 2.12.2, 2.13.1, 2.14.1,
  2.15.1, 2.16.1**. O corpo salta de 2.9.3 direto para 2.11.1.

**Convenção adotada aqui:** o capítulo é **2.10 - Itens de Compliance** (nome do
índice) e contém os critérios **2.11.x a 2.16.x** (números do corpo). **Não crie
um `2.10.1`.** Não trate o cabeçalho `2.11 - COMPLIANCE` como se os critérios
2.12-2.16 pertencessem a uma seção 2.11.

Consequência prática: quem abre o livro pelo índice espera "2.10"; quem abre na
página 43 espera "2.11". **A plataforma precisa mostrar os dois** ou explicar a
divergência na interface — senão o sistema parece errado para metade dos
usuários. Esta escolha ainda **não foi ratificada pelo dono do produto**.

## Distinga faixa de gatilho de anulação

O livro mistura as duas coisas na mesma página, e modelá-las igual produz
pontuação errada. São mecanismos diferentes:

- **Faixa (banda):** pontuação escalonada por desempenho. Ex.: 2.4.1 dá 20 pts
  acima de 95%, 15 pts entre 85 e 94,99%, 10 pts entre 80 e 84,99%.
- **Gatilho de anulação:** condição binária que **zera** o item independente do
  desempenho. Ex.: produto vencido no PDV zera os 12 passos daquela loja; alvará
  solicitado após o vencimento perde o ponto "sem exceção"; data de FI posterior
  à NFD anula "sem exceções"; ATA não respondida até o 5º dia útil anula a
  pontuação do mês.

Gatilhos frequentes, por família:
- **Prazo de ATA** (2.2.1, 2.2.2, 2.2.3, 2.6.1): resposta na plataforma até o
  **quinto dia útil do mês seguinte**, senão a pontuação do mês é anulada.
- **Produto vencido** (2.4.1-2.4.4, 2.5.1): zera os passos da loja avaliada.
- **Kit básico incompleto**: desconto por item ausente (-1,0 em 2.4.1 e 2.5.1;
  -0,5 em 2.4.2, 2.4.3, 2.4.4).
- **Piso de 80%** nos passos da venda: a soma dos passos precisa ficar ≥ 80%.

## Lacunas reais da fonte — não preencha por conta própria

1. **1.2.1 (Cobertura) não tem pontuação na V3.** A página traz aviso em
   vermelho: *"As categorias envolvidas estão em análise e, assim que validadas,
   o Livro será atualizado e compartilhado."* Precisa de estado "pendente" no
   modelo — nunca de um número inventado.
2. **As somas não fecham.** Os critérios do Capítulo II somam **232** pontos, mas
   o capítulo vale **400**. Os itens de compliance somam **62**. O livro não
   mostra como 232 (ou 232+62=294) vira 400, nem como os pontos mensais e
   por organização de 1.1/1.4 viram os 1.600 de Performance. **A regra de
   conversão não está no livro.** É a lacuna mais importante: sem ela, não há
   como calcular aderência fielmente. Pergunte ao dono do produto.
3. **A Matriz de Meritocracia não está definida.** Citada **uma única vez** em
   todo o PDF (p4, regra IV), apenas para dizer que abaixo de 80% em compliance
   o Broker é classificado como **1/1**. A matriz em si não é tabulada nem
   diagramada em lugar nenhum.
4. **O anexo de SHE não existe.** O índice promete o tema
   `RECOMENDAÇÕES DE SEGURANÇA (SHE)`, mas não há ANEXO XII. O único conteúdo de
   SHE é o critério 2.8.6, que aponta para o **Anexo X**.

## Defeitos de impressão conhecidos

Registre-os como quirks da fonte; **não os "conserte" em silêncio**, porque quem
confere contra o PDF vai achar que o sistema está errado:

- Faixas do booster OG numeradas `1, 2, 2, 3, 4` — dois itens com "2".
- Buracos nas faixas do booster: **exatamente 7,00%** cai entre "abaixo de 7%" e
  "de 7,01%"; o mesmo entre 9,9% e 10%, e entre 19,9% e 20%.
- Página 5 anuncia **"quatro critérios de desempate"** e lista **três**.
- Faixas de 2.4.1 impressas fora de ordem: 20,0 / 10,0 / 15,0.
- Typos preservados: `PALLTES` (p48), `TEM` (p61, provavelmente MTE), `Cilco`
  (p22), `visistas` e `6,0 pt` (p31), `deve se trar` (p52).

## Extrair de novo do PDF

Duas armadilhas, ambas já custaram tempo:

1. **O caminho de PDF da ferramenta Read exige poppler, que não está instalado**
   nesta máquina. Use **PyMuPDF** (`import fitz`) — está disponível e o PDF tem
   camada de texto limpa, então a extração é verbatim e não precisa de OCR.
2. **As tabelas de pontos do VBC (páginas 9 e 10) são imagens raster.** Extração
   por camada de texto **passa batido silenciosamente** pelo maior bloco de
   pontos do livro (138+20 e 136+40,5). Renderize essas páginas em PNG e leia
   como imagem. É por isso que o seed do banco ficou com `max_points` nulo.

## Formato brasileiro

Vírgula decimal em todo o livro: `1,25`, `8,0`, `70,00%`, `+0,100%`. Há valores
fracionários reais (`1,25` em duas categorias Purina de 1.1.2) — **não modele
pontos como inteiro**.

## Relação com o banco

O catálogo vive na tabela `criteria` (`supabase/migrations/*_program_catalog.sql`),
semeada em `*_seed_program_2026.sql` sob a versão `LIVRO-2026-V3`. `chapter` é um
enum Postgres: `performance | excelencia_operacional | compliance` — ou seja, **o
banco modela compliance como capítulo próprio**, enquanto o livro o coloca dentro
do Capítulo II como 2.10. Divergência conhecida, ainda não ratificada.

Os 39 critérios do livro conferem 1:1 com o seed. **Há um 40º código no banco que
não existe no livro: `1.9.0`.** É o Booster de crescimento OG, que o livro
descreve na página 4 como **regra de programa**, e não como critério numerado —
`1.9.0` foi inventado pelo seed para lhe dar uma linha na tabela, com
`counts_toward_chapter = false`. Quem procurar "1.9.0" no PDF **não vai achar**.
Ao exibir esse item na interface, não o apresente como um critério do livro.

Vários critérios estão com `max_points` nulo e `points_pending_review = true`
justamente por causa das lacunas 1 e 2 acima. **Ao exibir totais por capítulo, não
sugira que o capítulo está completo** — os pendentes precisam aparecer como
pendentes.
