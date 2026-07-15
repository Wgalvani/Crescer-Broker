# Prompt de build — cole isto no Claude Code (VS Code)

> Como usar: abra a pasta do projeto no VS Code com o Claude Code vinculado, coloque o arquivo `PRD-CRESCER-BROKERS-AUDITORIA.md` e a pasta `assets/` (logos) na raiz do projeto, e cole o prompt abaixo na conversa do Claude Code. Ajuste o texto entre `[colchetes]` antes de enviar.

---

```
Você vai atuar como engenheiro de software sênior full-stack + UI/UX para me ajudar a
construir do zero a plataforma "CRESCER+BROKERS Auditoria" — um sistema interno do
Grupo Arantes (Broker Nestlé) para acompanhar, auditar e simular o desempenho da empresa
no programa de excelência Nestlé "CRESCER+BROKERS 2026".

Leia primeiro o arquivo PRD-CRESCER-BROKERS-AUDITORIA.md na raiz deste projeto — ele é a
fonte de verdade de todos os requisitos, papéis de usuário, catálogo de critérios de
pontuação (extraído do livro oficial da Nestlé) e diretrizes de identidade visual. Não
prossiga sem ler esse documento inteiro primeiro.

## Stack técnica
- Frontend: React + TypeScript + Vite, Tailwind CSS, shadcn/ui para componentes.
- Backend/BD: Supabase (Postgres + Auth + Storage + Row Level Security).
- Deploy: Vercel (frontend) + Supabase Cloud (backend).
- Gráficos/dashboards: Recharts (ou biblioteca equivalente já usada em outros projetos
  do Grupo Arantes, se houver um padrão a seguir).
- Formulários: react-hook-form + zod para validação.
- Gestão de estado de servidor: React Query (Tanstack Query).

## Identidade visual (obrigatório)
- Use os ativos em assets/logo-crescer-brokers-lockup.png e assets/logo-nestle-white.png
  como referência de marca. O logo do programa deve aparecer no cabeçalho fixo de toda
  tela autenticada e centralizado na tela de login.
- Paleta de cores (definida no PRD, seção 8.2):
  - Azul institucional: #195AB4
  - Verde-limão (ação/acento): #7DCD07 | Verde-limão claro: #98E428
  - Verde escuro institucional (headers, login): #04411A → gradiente para #010D05
  - Neutros: texto #1A1A1A, fundo de card #F5F7F6, borda #D9DEDC
  - Reserve vermelho/âmbar exclusivamente para semáforos de risco/compliance — nunca use
    essas cores para elementos de marca.
- Visual "alto nível corporativo": tipografia arredondada/bold em títulos, cards com
  sombra sutil, bastante espaço em branco, iconografia hexagonal ecoando o padrão do
  logo. Nada de UI genérica de admin template — deve parecer um produto sob medida.
- Mobile-first nas telas de checklist de campo (vendedor/promotor); desktop-first no
  dashboard executivo e nos módulos de gestão.

## Estrutura de dados (ponto de partida — ajuste conforme necessário)
Modele no Supabase (com RLS desde o início) entidades como:
- organizations (multi-filial do Broker)
- users / profiles (vinculado ao auth.users do Supabase) com role, department,
  organization_id, status
- roles e permissions (RBAC granular — ver seção 4 e 6.11 do PRD)
- program_versions ("Livro 2026 v3" etc. — versionamento de regras, seção 6.12 do PRD)
- criteria (catálogo dos ~30 critérios do livro: código, capítulo, módulo, descrição,
  regra de pontuação em JSON flexível, quem avalia, fonte de dado, periodicidade)
- scoring_entries (lançamentos mensais/trimestrais de efetivo vs. meta por critério,
  organização e período, com pontuação calculada)
- compliance_items (os 7 itens de compliance, com status e vencimento)
- documents (alvarás, certidões, protocolos — com data de emissão/validade)
- meetings (matinal, RPS, ciclo) e meeting_attendance
- field_checklists (passos de venda/promotor) e field_checklist_items
- evidence (anexos vinculados a qualquer entidade acima, com metadados e log de auditoria)
- audit_log (trilha imutável de alterações relevantes para pontuação)
- notifications

Implemente RLS por organization_id e por department/role desde a primeira migration —
não trate segurança como algo a adicionar depois.

## Prioridade de implementação (siga o roadmap do PRD, seção 11)
1. Auth (Supabase Auth) + CRUD de usuários com RBAC + tela de login com a identidade
   visual da marca. O usuário Administrador deve ter acesso irrestrito a todos os
   módulos e à própria gestão de usuários/permissões.
2. Módulo de Configuração do Programa: CRUD do catálogo de critérios (a Nestlé pode
   ajustar regras durante o ano — a plataforma não pode depender de deploy de código
   para isso).
3. Módulos Performance e Excelência Operacional com lançamento manual de dados
   (formulários por critério, seção 6.2 e 6.3 do PRD).
4. Dashboard Executivo com semáforo por capítulo/módulo/critério e simulação de
   pontuação total (seção 6.1 e 6.7 do PRD).
5. Módulo de Compliance com alertas de vencimento em D-30/D-15/D-5 (seção 6.6 e 6.9).
6. Nas fases seguintes: Gestão de Reuniões/Atas, Central de Evidências, App de campo
   mobile para checklists de venda/visita, Simulador "e se", relatórios exportáveis.

## Primeiro passo que eu quero que você faça agora
1. Confirme comigo que leu o PRD e resuma em poucas linhas os módulos e papéis que
   entendeu — antes de gerar qualquer código.
2. Proponha a estrutura de pastas do projeto (monorepo simples: /app front-end +
   /supabase migrations).
3. Gere as migrations iniciais do Supabase para as entidades de Auth/RBAC e o catálogo
   de critérios (criteria), populando o catálogo com os critérios do Capítulo I e II
   listados nas tabelas do PRD (seção 5), para eu não ter que digitar isso manualmente.
4. Só depois disso, comece a UI, começando pela tela de login + layout autenticado com
   o cabeçalho de marca.

[Se você já tiver um projeto Supabase criado, informe aqui a URL/projeto a ser usado.
 Se não tiver, peça para eu criar um novo projeto Supabase antes de gerar as migrations.]
```
