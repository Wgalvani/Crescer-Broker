# PRD — Plataforma de Auditoria e Gestão do Programa CRESCER+BROKERS

**Produto:** Plataforma interna de acompanhamento, auditoria e gestão de desempenho do Broker no programa de excelência Nestlé "CRESCER+BROKERS 2026"
**Empresa:** Grupo Arantes (Broker Nestlé)
**Documento gerado a partir de:** "LIVRO CRESCER + 2026 - NIM OFICIAL - V3.pdf" (62 páginas, fonte oficial Nestlé)
**Versão:** 1.0 — Levantamento de Requisitos
**Data:** 15/07/2026
**Autor:** Orquestrador de produto / UI-UX (assistido por IA), a partir de solicitação de William Cintra (TI)

---

## 1. Contexto e problema de negócio

O **CRESCER+BROKERS** é o programa de excelência da Nestlé para avaliar seus Brokers (prestadores de serviço de distribuição/venda) no Brasil. O programa vale para o ano-calendário de 2026, é dividido em dois capítulos — **Performance** (1.600 pontos) e **Excelência Operacional** (400 pontos) — mais um bloco obrigatório de **Itens de Compliance** (mínimo de 80% de conformidade, sob risco de desclassificação do ranking). O Broker com melhor desempenho é reconhecido como o melhor do Brasil anualmente, com reconhecimento adicional aos três melhores a cada trimestre.

Hoje, a apuração desses ~30 critérios depende de fontes de dados dispersas (PRESER, SAP, BEES, Connect Merchan, Flexx GPS, BI de Supply Chain, DocuSign, planilhas, visitas *in loco*, atas de reunião) e de processos manuais dentro do próprio Broker (preenchimento de atas, autoavaliações, controle de vencimento de documentos). Isso cria risco de:

- Perda de pontos por prazos não cumpridos (ex.: ATA até o 5º dia útil, alvará vencido, certidão trimestral não enviada).
- Falta de visibilidade gerencial sobre "quanto falta" para a próxima faixa de pontuação ou para não cair para 1/1 na Matriz de Meritocracia.
- Dificuldade de cada departamento (Comercial, Merchandising, Logística, TI, RH, Financeiro, Supply Chain) enxergar isoladamente seus próprios KPIs e prazos dentro do programa.
- Ausência de trilha de evidências organizada para os itens auditados presencialmente pelos Coordenadores de Excelência da Nestlé.

**Objetivo do produto:** dar ao Grupo Arantes uma plataforma própria (não é um sistema da Nestlé) para **autogerir, auditar internamente e simular** seu desempenho no CRESCER+BROKERS, maximizando pontuação, evitando desclassificação por compliance e melhorando a colocação no ranking nacional — cada departamento com seus KPIs, visão consolidada para a diretoria, e um administrador (TI) com controle total de usuários e configurações.

---

## 2. Objetivos do produto

1. Centralizar em um único lugar todos os ~30 critérios de pontuação do livro 2026, com meta, realizado, pontuação obtida e status (em dia / em risco / perdido).
2. Fornecer a cada departamento responsável (Comercial/Vendas, Merchandising, Logística, TI, RH, Financeiro, Supply Chain) um painel com seus próprios KPIs e prazos — ninguém precisa abrir o livro em PDF para saber o que fazer.
3. Reduzir a zero as perdas de pontuação "bobas" (prazo de ATA, alvará vencido, certidão trimestral, verba pendente >60 dias) por meio de alertas automáticos antes do vencimento.
4. Simular em tempo real a pontuação total (1.600 + 400 + booster de OG) e a posição estimada no ranking / matriz de meritocracia, permitindo decisões de priorização.
5. Manter uma trilha de evidências auditável (atas, fotos *in loco*, certidões, protocolos) para defesa em caso de auditoria da Nestlé ou de eventual litígio.
6. Entregar uma experiência visual de **alto padrão corporativo**, com a identidade do programa (logo CRESCER+BROKERS / Nestlé) no topo, intuitiva o suficiente para vendedores e promotores em campo (mobile) e para gestores no escritório (desktop).
7. Permitir gestão de usuários com controle de acesso por perfil/departamento, com um administrador de acesso total (CRUD completo).

### Fora de escopo (nesta primeira versão)

- Integração automática/API direta com sistemas da Nestlé (PRESER, SAP, BEES, BI de Supply Chain, MB51, CEM, SUV). Esses sistemas são internos à Nestlé e o Broker normalmente não tem acesso via API — a entrada de dados será manual ou por importação de planilha/extrato exportado (ver seção 9).
- Cálculo oficial de premiação — a plataforma **simula** a pontuação para gestão interna; o resultado oficial é sempre o publicado pela Nestlé.
- Suporte a outros Brokers fora do Grupo Arantes (a plataforma é para uso interno, mono-empresa, ainda que a arquitetura de dados suporte multi-organização/multi-filial internamente).

---

## 3. Fonte da verdade e regra de governança do conteúdo

Todo o conteúdo de critérios, pesos e regras **deve seguir literalmente o livro oficial da Nestlé** (anexo a este PRD). A plataforma não deve alterar regras de pontuação do programa — apenas digitalizar, automatizar e dar visibilidade a elas. Como o próprio manual afirma que "a Nestlé reserva-se o direito de fazer ajustes se necessário durante [o ano]", o módulo de **Configuração do Programa** (seção 7.12) deve permitir que um administrador **parametrize** metas, faixas e pesos ano a ano / trimestre a trimestre, sem precisar de deploy de código a cada atualização do livro.

---

## 4. Personas e papéis (roles)

| Papel | Quem é | Necessidade principal |
|---|---|---|
| **Administrador (TI)** | William Cintra / equipe de TI | Acesso total: CRUD de usuários, permissões, parametrização do programa, todos os módulos, logs de auditoria. |
| **Diretoria / Sponsor** | Diretor(a) responsável pela conta Nestlé | Visão executiva consolidada (dashboard), sem editar dados, com drill-down. |
| **Monitor CRESCER+BROKERS** | Colaborador dono do programa dentro do Broker (papel citado no próprio manual como participante obrigatório das reuniões) | Lança/consolida dados de todos os módulos, controla prazos, organiza evidências, é o "super usuário" operacional abaixo do admin. |
| **Gerente de Vendas** | Gestão comercial | KPIs de Performance (VBC, Cobertura, BEES, Ruptura/Positivação), condução e resultado das reuniões (Matinal, RPS, Ciclo). |
| **Supervisor de Vendas** | Liderança de campo | Visitas de desenvolvimento de rota, atas de matinal, acompanhamento dos vendedores da sua equipe. |
| **Coordenador de Merchandising** | Gestão de promotores | KPIs do promotor (8 passos), execução em loja, ruptura. |
| **RH** | Recursos Humanos | Turn-over, processo de recrutamento (Anexo I), manual de identidade visual/uniformes. |
| **Financeiro** | Financeiro do Broker | Verbas em aberto, certidões negativas, inadimplência tratada na RPS. |
| **Logística / Supply Chain** | Operação de CD | Checklists de Supply Chain (2.8.x), operações logísticas (indenização, destruição, transpasse, escrituração). |
| **TI (interno)** | Equipe de TI do Broker | Equipamentos (2.7.1), Flexx GPS, ferramentas digitais. |
| **Vendedor / Vendedor Especializado (Professional/Purina) / Promotor** | Força de campo | App simplificado (mobile) para checklist dos passos de venda/visita, kit básico, evidências fotográficas. Consulta apenas seus próprios indicadores. |
| **Auditor interno / Compliance** | Função de controle interno | Visão consolidada dos Itens de Compliance, alvarás, certidões, prazos, e trilha de evidências para eventual fiscalização. |

Todos os papéis são configuráveis — o administrador pode criar novos perfis e customizar permissões granularmente (ver seção 7.11).

---

## 5. Estrutura de pontuação do programa (extraída do livro oficial)

### 5.1 Capítulo I — Performance (1.600 pontos)

| Cód. | Critério | Regra de pontuação | Quem avalia | Fonte de dado | Periodicidade |
|---|---|---|---|---|---|
| 1.1.1 | VBC por organização | Efetivo vs. meta da carta-meta | Sede Nestlé | PRESER | Mensal |
| 1.1.2 | VBC por grupo de categorias | ≥100% = pts Meta; ≥110% = + pts Ideal | Sede Nestlé | Dashboard VBC | Mensal |
| 1.2.1 | Cobertura por categoria | Cliente coberto = VBC > R$ 30 | Sede Nestlé | PRESER | Mensal |
| 1.3.1 | Sortimento Prioritário Farma B | 8,0 pts faixa Ideal / 4,0 pts faixa Meta | Sede Nestlé | PRESER | Mensal |
| 1.4.1 | VBC via BEES | 7,0 pts Meta por organização + 3,0 pts adicional Ideal | Sede Nestlé | BEES | Mensal |
| 1.4.2 | Cobertura via BEES | 5,0 pts Meta por organização + 3,0 pts adicional Ideal | Sede Nestlé | BEES | Mensal |
| 1.5.1 | % Ruptura Zero (SKUs Hero) | 10,0 pts se ruptura ≤ 5%; mín. 60% dos PDVs roteirizados pesquisados | Sede Nestlé | Dash Ruptura Zero 3.0 / Connect Merchan | Mensal |
| 1.5.2 | Positivação de visitas em rota | 8,0 pts se positivação > 70% | Sede Nestlé | Broker 3.0 | Mensal |

**Booster de crescimento OG** (NNS NIM – BRL1, BRP2, BRN2, BRN8), somado ao realizado total, apurado por faixa trimestral:

| Faixa de crescimento | Pontos |
|---|---|
| < 7% | 0 |
| 7,01% a 9,9% | 100 |
| 10% a 14,9% | 150 |
| 15% a 19,9% | 200 |
| > 20% | 300 |

### 5.2 Capítulo II — Excelência Operacional (400 pontos)

| Cód. | Critério | Regra de pontuação | Quem avalia | Fonte de dado | Periodicidade |
|---|---|---|---|---|---|
| 2.1.1 | Turn-over | 8,0 pts se ≤ 15% | Coord. Excelência | Formulário Padrão / E-Social | Trimestral |
| 2.1.2 | Identidade visual / uniformes | 5,0 pts se 100% aderente | Coord. Excelência | *In loco* | Trimestral |
| 2.2.1 | Reunião Matinal (5x/semana) | 8,0 pts; ATA até o 5º dia útil do mês seguinte | Broker (autodeclarado) | Plataforma CRESCER+BROKERS | Mensal |
| 2.2.2 | RPS (mín. 4/mês, sextas-feiras) | 5,0 pts | Broker | Plataforma CRESCER+BROKERS | Mensal |
| 2.2.3 | Reunião Mensal (Ciclo) | 5,0 pts; participação mín. 90% | Broker | Plataforma CRESCER+BROKERS | Mensal |
| 2.2.4 | Ferramenta de gestão de visitas (Flexx GPS) | 6,0 pts uso diário | Coord. Excelência | *In loco* | Trimestral |
| 2.3.1 | Prazo de processamento (faturamento) | 8,0 pts se ≥ 90% no prazo (48h/72h) | Coord. Excelência | *In loco* | Trimestral |
| 2.3.2 | Frequência de atendimento sugerida | 6,0 pts (tolerância 5%) | Coord. Excelência | *In loco* (sistema FLEXX) | Trimestral |
| 2.4.1 | 12 passos da venda — Vendedor NiM | 20,0 (>95%) / 15,0 (85–94,99%) / 10,0 (80–84,99%) pts | Coord. Excelência | *In loco* (mín. 6 PDVs) | Trimestral |
| 2.4.2 | 8 passos — Professional Food (BRN2) | 15,0 (90–100%) / 6,0 (80–89,99%) pts | Coord. Excelência | *In loco* | Trimestral |
| 2.4.3 | 9 passos — Professional Bebidas (BRN8) | 15,0 / 6,0 pts | Coord. Excelência | *In loco* | Trimestral |
| 2.4.4 | 9 passos — Canal Especializado Purina | 15,0 / 6,0 pts | Coord. Excelência | *In loco* | Trimestral |
| 2.5.1 | 8 passos do Promotor | 11,0 (7–8 passos) / 5,0 (5–6 passos) pts | Coord. Excelência | *In loco* | Trimestral |
| 2.6.1 | Visita de desenvolvimento de rota (Supervisor) | 6,0 pts (6 vendedores × 5 PDVs/mês) | Broker | Connect Merchan / Plataforma | Mensal |
| 2.7.1 | Equipamentos (reserva mín. 10%) | 4,0 pts | Coord. Excelência | *In loco* | Trimestral |
| 2.8.1 | Performance Supply Chain | 10,0 (7–9 itens) / 5,0 (4–6) / 3,0 (3 itens) pts | Sede Operações Brokers | BI (Visão Performance Brokers) | Mensal |
| 2.8.2 | Check List — Processos Operacionais | 14,0 pts se ≥ 80% | Sede Operações Brokers | *In loco* | Trimestral |
| 2.8.3 | Check List — Gestão e Performance | 14,0 pts se ≥ 80% | Sede Operações Brokers | *In loco* | Trimestral |
| 2.8.4 | Check List — Processos de Distribuição | 14,0 pts se ≥ 80% | Sede Operações Brokers | *In loco* | Trimestral |
| 2.8.5 | Check List — Processos de Qualidade | 14,0 pts se ≥ 95% | Sede Operações Brokers | *In loco* | Trimestral |
| 2.8.6 | Check List — Processos de SHE | 14,0 pts se ≥ 95% | Sede Operações Brokers | *In loco* | Trimestral |
| 2.9.1 | Emissão de crédito por indenização em até 30 dias | 5,0 pts (100% das notas) | Coord. Excelência | *In loco* | Trimestral |
| 2.9.2 | Processo de indenização (conferência de mercadoria) | 5,0 pts | Coord. Excelência | *In loco* | Trimestral |
| 2.9.3 | % de produtos destruídos na planta | 5,0 (−10%) / 2,0 (−8%) / 1,0 (−6%) pts vs. 2025 | Sede Nestlé | Dash de DSP | Trimestral |

### 5.3 Itens de Compliance (mínimo 80% obrigatório — 95% em alguns itens)

| Cód. | Critério | Pontos | Periodicidade | Observação crítica |
|---|---|---|---|---|
| 2.11.1 | Verbas em aberto há mais de 60 dias | 5,0 | Mensal | Monitorar semanalmente arquivo de verbas |
| 2.12.1 | Alvarás atualizados | 10,0 | Trimestral | Sem exceções — protocolo a cada 6 meses se não emitido |
| 2.12.2 | Certidões negativas de débitos | 10,0 | Trimestral | Enviar via Forms até o fim do trimestre |
| 2.13.1 | Expedição de produtos salvage/bloqueados/restritos (≤15 dias venc.) | 5,0 | Mensal | Verificação via MB51 |
| 2.14.1 | Processo de Transpasse | 12,0 | Trimestral | Nota emitida = expedida no mesmo dia |
| 2.15.1 | Processo de escrituração (≤30 dias) | 9,0 | Mensal | Verificação via SAP/NBS |
| 2.16.1 | Produtos vencidos no PDV | 11,0 | Trimestral | Qualquer unidade vencida zera o item |

**Regra de desclassificação:** não atingir 80% de compliance anula a pontuação do trimestre onde a falha foi identificada; no acumulado do ano, resulta em classificação 1/1 na Matriz de Meritocracia.

### 5.4 Critérios de desempate (ranking)

1. Performance VBC acumulada → +0,100%
2. Cobertura de clientes acumulada → +0,050%
3. % de itens de Compliance → +0,050%

*(O livro lista um 4º critério mencionado no índice mas sem detalhamento nas páginas disponíveis — o módulo de ranking deve deixar esse critério parametrizável/expansível.)*

---

## 6. Requisitos funcionais (módulos)

### 6.1 Dashboard Executivo
- Pontuação total consolidada (Performance + Excelência Operacional + Booster OG) com meta vs. realizado.
- Semáforo por capítulo, por módulo e por critério individual (verde = em dia, amarelo = em risco de prazo, vermelho = perdido/zerado).
- Status de compliance (% atual vs. mínimo de 80%/95%) com alerta de risco de desclassificação.
- Posição estimada no ranking trimestral/anual e simulação dos critérios de desempate.
- Linha do tempo de prazos críticos dos próximos 30 dias (ATAs, alvarás, certidões, checklists).
- Filtros por período (mês/trimestre/ano) e por organização/filial (o Broker pode ter mais de uma organização de vendas, como citado no manual).

### 6.2 Módulo Performance (Cap. I)
- Lançamento/importação de efetivo mensal por critério (1.1 a 1.5), por organização e por categoria.
- Comparação automática efetivo vs. meta (carta-meta), com cálculo de faixa (Meta/Ideal) e pontuação.
- Série histórica mensal e projeção de fechamento do trimestre.
- Campo de meta parametrizável mensalmente (a carta-meta muda todo mês).

### 6.3 Módulo Excelência Operacional (Cap. II)
Sub-módulos espelhando 2.1 a 2.9, cada um com seu formulário de apuração, evidências anexáveis e responsável (departamento) definido conforme tabela de papéis (seção 4):
- **Pessoas** (RH): turn-over, uniformes.
- **Planejamento de Vendas** (Comercial): controle de Matinal, RPS e Ciclo com geração de ATA (ver 6.4).
- **Processos de Vendas** (Comercial/Financeiro): prazo de faturamento, frequência de atendimento.
- **Vendedor / Promotor** (Comercial/Merchandising): checklist digital dos passos de venda (ver 6.5).
- **Desenvolvimento da Rota** (Supervisão): registro das visitas de desenvolvimento.
- **TI**: inventário de equipamentos e reserva técnica.
- **Supply Chain** (Logística): checklists 2.8.2 a 2.8.6, com autoavaliação mensal comparada à avaliação presencial (mecanismo de acurácia exigido pelo próprio manual).
- **Operações Logísticas** (Logística/Financeiro): indenização, destruição, transpasse.

### 6.4 Gestão de Reuniões e Atas
- Calendário de Matinais (5x/semana), RPS (sextas) e Ciclo (1ª quinzena do mês).
- Templates de pauta pré-carregados a partir dos Anexos II, III e IV do livro (ex.: blocos da matinal, presença obrigatória por reunião).
- Registro de presença (lista de participantes, com papéis obrigatórios pré-configurados por tipo de reunião).
- Contador regressivo/alerta para o **5º dia útil do mês seguinte** — prazo que, se perdido, **anula a pontuação do mês inteiro** (regra crítica do manual).
- Upload de evidência (ata assinada/PDF, print de teleconferência com lista de presença ≥ 90%).

### 6.5 Avaliação de Campo — Passos da Venda e Visita
- Checklists digitais para: 12 passos NiM, 8 passos Professional Food (BRN2), 9 passos Professional Bebidas (BRN8), 9 passos Purina, 8 passos do Promotor — conteúdo extraído dos Anexos V a IX.
- Controle de elegibilidade (vendedor/promotor com menos de 90 dias na função não é avaliado, salvo concordância do Broker).
- Checklist de **Kit Básico** por função, com penalização automática (–1,0 ou –0,5 pt por item ausente, conforme critério).
- Regra de zeramento automático se identificado produto vencido no PDV avaliado.
- App mobile-first (promotores e vendedores fazem isso em campo, não no escritório).

### 6.6 Módulo de Compliance
- Painel único dos 7 itens de compliance (seção 5.3) com status, vencimento e responsável.
- Repositório de documentos com data de emissão/validade: alvarás, AVCB, Vigilância Sanitária, certidões (lista completa do Anexo XI), com **alertas automáticos 30/15/5 dias antes do vencimento**.
- Fluxo de protocolo (quando o órgão público não emite o documento antes do vencimento — regra dos 6 meses).
- Monitoramento semanal de verbas pendentes (>60 dias) com fila de ação.
- Indicador de % de compliance acumulado no ano vs. mínimo de 80% exigido.

### 6.7 Ranking e Simulador de Pontuação
- Cálculo em tempo real da pontuação total simulada (1.600 + 400 + booster OG).
- Simulador "e se": usuário ajusta hipóteses (ex.: "se eu atingir 110% de VBC este mês, quanto ganho?") e vê o impacto na pontuação total.
- Aplicação dos critérios de desempate (seção 5.4) na simulação de posição.
- Histórico de campeões (dado presente no livro, página "CAMPEÕES") como contexto motivacional/institucional.

### 6.8 Central de Evidências e Documentos
- Repositório central de anexos (fotos *in loco*, atas, certidões, protocolos, formulários) vinculado a cada critério e período de apuração.
- Metadados obrigatórios: data, autor do upload, critério relacionado, geolocalização opcional (para evidência de visita em PDV).
- Versionamento e trilha de auditoria (quem alterou o quê e quando) — essencial dado que "práticas de manipulação de dados" é penalidade máxima do programa (anula pontuação e pode gerar litígio).

### 6.9 Notificações e Alertas
- Central de notificações in-app + e-mail (e opcionalmente WhatsApp/Push, ver seção 10) para: prazos de ATA, vencimento de documentos, checklist de Supply Chain pendente, risco de compliance abaixo de 80%, autoavaliação divergente da avaliação presencial.
- Configuração de destinatários por tipo de alerta e por papel/departamento.

### 6.10 Relatórios e Exportação
- Exportação em PDF/Excel dos indicadores por período, para uso em reuniões de Ciclo e apresentações à Nestlé.
- Relatório consolidado "Livro de Resultados" espelhando a estrutura do índice oficial (Performance / Excelência Operacional / Anexos).

### 6.11 Gestão de Usuários (CRUD) e Controle de Acesso
- CRUD completo de usuários: criar, visualizar, editar, inativar/excluir.
- Cadastro com nome, e-mail corporativo, departamento, papel (role), organização/filial, status (ativo/inativo).
- Autenticação por usuário e senha (login corporativo), com opção futura de SSO (Microsoft/Google Workspace) e MFA.
- Perfis de acesso (RBAC) por papel (seção 4), com o **Administrador tendo acesso irrestrito** a todos os módulos, dados e configurações, incluindo a própria gestão de usuários e permissões.
- Log de auditoria de acesso (login, alterações de permissão, ações administrativas).
- Política de senha (complexidade mínima, expiração, bloqueio por tentativas, redefinição segura).

### 6.12 Configuração do Programa (parametrização anual)
- Cadastro/edição de critérios, pesos, faixas de pontuação e periodicidade — para acompanhar eventuais ajustes que a Nestlé publique durante o ano (o próprio manual prevê isso).
- Cadastro de metas mensais/trimestrais (carta-meta) por organização/categoria.
- Versionamento de "livros" (ex.: Livro 2026 v3, v4...) preservando o histórico de regras vigentes em cada período — importante para auditoria retroativa.

---

## 7. Requisitos não funcionais

| Categoria | Requisito |
|---|---|
| **Segurança** | RBAC granular; criptografia em trânsito (TLS) e em repouso; hashing de senha (bcrypt/argon2); MFA para admin; row-level security por organização/departamento no banco de dados. |
| **Privacidade / LGPD** | Dados de RH (turn-over, admissão/demissão) e de colaboradores são dados pessoais — exige base legal, controle de acesso restrito ao RH/Admin, política de retenção e anonimização quando aplicável. |
| **Disponibilidade** | Meta de 99,5% (uso corporativo interno, não é sistema de missão crítica 24/7, mas precisa estar disponível em dias úteis e durante visitas de auditoria). |
| **Performance** | Dashboard executivo carregando em até 2s com dados de até 12 meses; formulários de campo funcionais em conexão 3G/4G instável (uso por promotores/vendedores). |
| **Responsividade / Mobile** | Checklists de campo (passos de venda, visitas) devem funcionar bem em smartphone, idealmente com suporte a modo offline com sincronização posterior (comum em áreas rurais/PDVs sem sinal). |
| **Auditabilidade** | Toda alteração de dado relevante para pontuação deve gerar log imutável (quem, quando, valor anterior/novo). |
| **Escalabilidade** | Arquitetura deve suportar múltiplas organizações/filiais do Broker e, potencialmente, múltiplos "livros" de programas de excelência no futuro (não só Nestlé). |
| **Acessibilidade** | Contraste adequado (WCAG AA), navegação por teclado no mínimo nas telas de gestão de usuários e dashboard. |
| **Internacionalização** | Não é requisito imediato (uso 100% Brasil/PT-BR), mas evitar strings hardcoded para facilitar manutenção. |
| **Backup / Continuidade** | Backup diário automatizado do banco de dados, com retenção mínima de 12 meses (ciclo do programa) + histórico de anos anteriores para comparação (ex.: destruição vs. 2025). |

---

## 8. Identidade visual e diretrizes de UI/UX

### 8.1 Ativos de marca extraídos do livro oficial
Foram extraídos diretamente da capa do PDF os seguintes ativos (disponibilizados na pasta `assets/` junto a este PRD):
- `logo-crescer-brokers-lockup.png` — logo completo (selo azul com "Nestlé" + wordmark "CRESCER+BROKERS" + "Programa de Excelência"), sobre fundo verde-escuro com padrão hexagonal.
- `logo-nestle-white.png` — logotipo Nestlé isolado, versão branca.

### 8.2 Paleta de cores (extraída por amostragem de pixel do material oficial)

| Uso | Cor | Hex |
|---|---|---|
| Azul institucional (selo/destaque) | Nestlé Blue | `#195AB4` |
| Verde-limão (acento/ação, "+" do logo) | Brand Lime | `#7DCD07` |
| Verde-limão claro (hover/gradiente) | Lime Light | `#98E428` |
| Verde escuro (fundo institucional, cabeçalhos) | Deep Green | `#04411A` |
| Verde quase-preto (fundo/gradiente) | Night Green | `#010D05` |
| Branco | White | `#FFFFFF` |
| Neutros de apoio (texto, cards, bordas) | Cinza corporativo | `#1A1A1A` (texto), `#F5F7F6` (fundo de card), `#D9DEDC` (bordas) |

Recomenda-se usar o **verde escuro/hexagonal como fundo de cabeçalhos e telas de login** (reforça a identidade do programa), **azul institucional para navegação/ações primárias**, e **verde-limão para indicadores positivos, progresso e call-to-action** — reservando vermelho/âmbar apenas para os semáforos de risco/compliance (não usar a paleta de marca para indicar erro).

### 8.3 Diretrizes de layout
- **Cabeçalho fixo** com o logo CRESCER+BROKERS à esquerda (conforme solicitado — "logo acima como identidade visual"), nome do usuário logado, notificações e seletor de organização/filial à direita.
- Tela de login com fundo no padrão hexagonal verde-escuro da marca e o selo/logo centralizado — primeira impressão "alto nível corporativo".
- Dashboard baseado em cards com semáforo (verde/âmbar/vermelho) e barras de progresso por capítulo/critério — segue o padrão observado em compliance dashboards e balanced scorecards de mercado (MetricStream, SmartSuite, V-Comply).
- Tabelas densas (catálogo de critérios, usuários) com filtros, busca e paginação — não sobrecarregar telas com listas longas sem filtro.
- Tipografia arredondada/bold para títulos (ecoando o wordmark do logo), texto de apoio em fonte neutra de alta legibilidade (ex.: Inter, Sora ou similar).
- Iconografia consistente por módulo (hexágono como elemento gráfico recorrente, ecoando o padrão de fundo do logo).
- Modo claro como padrão; modo escuro opcional usando a própria paleta verde-escura da marca (fica natural, pois já é escura).

### 8.4 Princípios de usabilidade
- **Ninguém deveria precisar abrir o PDF do livro** para saber o que fazer — cada critério na plataforma traz objetivo, regra resumida e prazo, com link para o texto oficial completo.
- Fluxos de campo (vendedor/promotor) devem ser de no máximo 3–4 toques para registrar um checklist.
- Estados vazios e mensagens de erro devem ser instrutivos ("Faltam 3 dias para o vencimento do alvará X — clique para iniciar o protocolo"), não apenas descritivos.

---

## 9. Integrações e fontes de dado

A maioria dos sistemas citados no livro é **interna à Nestlé** (PRESER, SAP, Dashboard VBC, BEES, Connect Merchan, Broker 3.0, BI de Supply Chain, MB51, CEM, SUV, NBS). Presume-se que o Broker **não tem acesso via API** a esses sistemas — apenas a extratos/relatórios/dashboards que a Nestlé disponibiliza periodicamente. Portanto, a estratégia de dados da plataforma deve ser:

1. **Importação manual assistida** (upload de CSV/Excel/PDF exportado do PRESER, BEES, BI etc.) com templates de mapeamento de colunas.
2. **Lançamento manual** para itens apurados por visita *in loco* pela Nestlé (o Broker registra sua **autoavaliação**, que deve ser comparável à avaliação oficial — já é uma exigência do próprio manual para os checklists de Supply Chain).
3. **Integrações internas do Broker**, se existirem (ex.: Flexx GPS, sistemas próprios de RH/E-Social) — a definir com TI em fase de descoberta técnica, fora do escopo deste PRD.
4. Estrutura de dados preparada para, no futuro, receber integrações automáticas caso a Nestlé venha a disponibilizar API/webhooks para Brokers.

---

## 10. Pesquisa de mercado e recomendações de melhoria

Pesquisa realizada em soluções de: (i) *partner/vendor scorecard software*, (ii) *audit & compliance management software*, (iii) *sales gamification & field execution dashboards*, (iv) *RBAC/CRUD para portais corporativos*. Os padrões abaixo são **recomendações de UX/produto** — não alteram nenhuma regra oficial do programa Nestlé, apenas a forma como o Broker gerencia seu próprio desempenho.

| Padrão observado no mercado | Aplicação recomendada no CRESCER+BROKERS Auditoria |
|---|---|
| Scorecards de parceiros/fornecedores usam semáforo + drill-down por dimensão ([Amazon Business — Vendor Scorecard](https://business.amazon.com/en/blog/vendor-scorecard); [Balanced Scorecard software](https://www.spiderstrategies.com/blog/best-balanced-scorecard-software/)) | Dashboard executivo com semáforo por capítulo → módulo → critério, já incorporado na seção 6.1. |
| Plataformas de compliance/auditoria priorizam alertas proativos antes do vencimento, não só relatórios retroativos ([MetricStream — Compliance Dashboard](https://www.metricstream.com/learn/compliance-dashboard.html); [V-Comply — Audit Management](https://www.v-comply.com/blog/internal-audit-management-software/)) | Central de Notificações (6.9) com alertas em D-30/D-15/D-5 para documentos e prazos de ATA — considerado requisito crítico, não "nice to have". |
| Softwares de auditoria mantêm trilha de evidências com anexos, metadados e versionamento, para defesa em auditoria externa ([SmartSuite — Audit Management](https://www.smartsuite.com/blog/audit-management-software)) | Central de Evidências (6.8) com log imutável, já incorporado. |
| Plataformas de execução de vendas em campo usam apps mobile leves, com checklist rápido e, em áreas de conectividade ruim, modo offline ([SalesRabbit Amplify](https://salesrabbit.com/amplify-analytics/); [Spotio — Sales Leaderboards](https://spotio.com/blog/sales-leaderboards/)) | App de campo (6.5) mobile-first com suporte a preenchimento offline e sincronização posterior — recomendado incluir no roadmap (ver seção 11). |
| Gamificação (ranking, badges, progresso visual) aumenta adesão de equipes de vendas em até ~100% em alguns estudos de caso ([BeatRoute — Gamification Mechanics](https://beatroute.io/sales-execution/why-gamification-could-be-the-next-big-thing-in-running-your-field-sales-operation/); [SalesScreen](https://www.salesscreen.com/)) | Aplicar gamificação **de forma sóbria e corporativa** no Ranking (6.7): barra de progresso rumo à próxima faixa de pontuação, reconhecimento interno dos "campeões do mês" — sem infantilizar a experiência para um programa com peso financeiro/contratual real. |
| RBAC maduro separa claramente papéis, permissões e escopo de dado (multi-tenant/least privilege) ([IBM — RBAC Implementation Guide](https://www.ibm.com/think/topics/role-based-access-control-implementation); [Oso — RBAC Best Practices](https://www.osohq.com/learn/rbac-best-practices)) | Modelo de papéis da seção 4 segue *least privilege*: cada papel só vê os módulos do seu departamento; Admin é o único com acesso irrestrito, alinhado ao pedido original. |
| Ferramentas de auto-avaliação comparadas à avaliação oficial (accuracy tracking) reduzem divergência e aumentam confiabilidade dos dados (prática já exigida pelo próprio livro nos checklists de Supply Chain) | Generalizar esse mecanismo de "acurácia da autoavaliação" para **todos** os módulos avaliados presencialmente (Vendedor, Promotor, TI, Pessoas), não só Supply Chain — ganho de maturidade proposto pela plataforma além do mínimo exigido pelo manual. |
| Simuladores "e se" (*what-if calculators*) são comuns em ferramentas de metas comerciais para orientar priorização | Simulador de pontuação (6.7) permite priorizar esforço no critério com melhor relação esforço/pontos antes do fechamento do trimestre. |

### Recomendações adicionais de produto (não obrigatórias, sugeridas para roadmap)

- **Modo "auditoria surpresa"**: checklist rápido que replica exatamente o que o Coordenador de Excelência da Nestlé avalia *in loco*, para o Broker se autoauditar antes de uma visita.
- **Painel por departamento na tela inicial pós-login**: cada usuário, ao entrar, vê primeiro os KPIs do seu próprio departamento (não o dashboard geral) — reduz ruído e aumenta adoção.
- **Exportação "Livro de Resultados"**: relatório espelhando fielmente a estrutura do índice oficial da Nestlé, facilitando comparação lado a lado nas reuniões de Ciclo.

---

## 11. Roadmap sugerido (fases)

| Fase | Escopo | Racional |
|---|---|---|
| **MVP (Fase 1)** | Autenticação + CRUD de usuários/RBAC; Configuração do Programa (critérios/pesos); Módulos Performance e Excelência Operacional com lançamento manual; Dashboard Executivo com semáforo; Módulo de Compliance com alertas de vencimento; identidade visual completa. | Resolve a dor mais urgente: visibilidade e prevenção de perda de pontos por prazo — maior ROI imediato. |
| **Fase 2** | Gestão de Reuniões e Atas com templates dos Anexos II–IV; Central de Evidências com upload/versionamento; Relatórios e exportação. | Cobre a exigência documental (ATA até 5º dia útil) que hoje é o maior risco operacional citado no manual. |
| **Fase 3** | App de campo mobile (passos de venda/promotor) com modo offline; Simulador de pontuação e critérios de desempate. | Requer app mobile dedicado — maior esforço técnico, mas impacto direto na maior categoria de pontos (2.4, 20 pts é o item de maior peso individual do programa). |
| **Fase 4** | Automatizações de importação (templates de planilha PRESER/BEES/BI), mecanismo de acurácia de autoavaliação generalizado, notificações multicanal (WhatsApp/push). | Ganhos de eficiência operacional após a base estar consolidada e validada em campo. |

---

## 12. Riscos e dependências

- **Dependência de dados externos**: sem acesso a API da Nestlé, a qualidade dos indicadores de Performance (Cap. I) depende de disciplina de importação manual — risco de defasagem se não houver rotina definida.
- **Mudança de regras no meio do ano**: o próprio manual prevê ajustes da Nestlé durante 2026 — a Configuração do Programa (6.12) deve ser tratada como requisito de dia 1, não como "fase futura".
- **Dados sensíveis de RH**: atenção a LGPD desde a modelagem inicial do banco de dados.
- **Adoção por força de campo**: vendedores/promotores em rota são o público mais sensível a fricção de uso — recomenda-se protótipo e teste de usabilidade do app de campo antes da Fase 3.

---

## 13. Anexos de referência

O conteúdo completo dos Anexos I a XI do livro oficial (procedimento de recrutamento, roteiros de Matinal/RPS/Ciclo, guias dos passos de venda por canal, kit básico por função, checklist detalhado de Supply Chain, lista de certidões exigidas) foi extraído e deve ser usado como conteúdo de referência/ajuda contextual dentro de cada módulo correspondente da plataforma (tooltips, páginas de "saiba mais"), evitando que o usuário precise consultar o PDF original durante o uso diário.

---

*Este documento é a base para o prompt de construção técnica (`PROMPT-CLAUDE-CODE.md`), a ser utilizado no Claude Code dentro do VS Code para iniciar a implementação com Supabase + React/Vercel.*
