# CRESCER+BROKERS Auditoria

Plataforma interna do **Grupo Arantes** (Broker Nestlé) para acompanhar, auditar e
simular o desempenho da empresa no programa de excelência Nestlé **CRESCER+BROKERS 2026**.

Não é um sistema da Nestlé. Os resultados oficiais são sempre os publicados por ela —
esta plataforma serve para autogestão, prevenção de perda de pontos por prazo e trilha
de evidências.

Requisitos completos: [PRD-CRESCER-BROKERS-AUDITORIA.md](./PRD-CRESCER-BROKERS-AUDITORIA.md).

---

## Estado atual: Fundação

Entregue e verificado contra o banco real:

- Autenticação (login, recuperação de senha) com a identidade visual do programa.
- Multi-tenancy por filial + RBAC com 14 papéis e 19 permissões, protegido por RLS.
- Catálogo dos 40 critérios do livro 2026, parametrizável sem deploy.
- Dashboard placeholder mostrando o catálogo carregado.

**Ainda não implementado** (roadmap do PRD, seção 11): módulos Performance e Excelência
Operacional, dashboard executivo com semáforo, módulo de Compliance com alertas,
gestão de reuniões/atas, central de evidências, app de campo e simulador.

---

## Stack

React 19 + TypeScript + Vite 8 · Tailwind v4 · TanStack Query · react-hook-form + zod ·
Supabase (Postgres + Auth + RLS) · Vercel

```
├── app/                 frontend
│   ├── public/brand/    ativos servidos ao browser (gerados)
│   ├── scripts/         geração dos ativos de marca
│   └── src/
│       ├── components/brand/   BrandLogo, HexPattern, BrandSplash
│       ├── features/auth/      SessionProvider, guards, hooks
│       ├── layouts/            AuthLayout, AppLayout
│       ├── lib/                supabase, queryClient, env
│       └── types/              database.types.ts (GERADO)
├── assets/              originais da marca (fora do build)
└── supabase/migrations/ schema, RLS e seeds
```

---

## Rodando localmente

```bash
cd app
npm install
cp .env.example .env.local     # preencha com os dados do projeto Supabase
npm run dev
```

| Script | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção |
| `npm run db:push` | aplica as migrations no projeto vinculado |
| `npm run db:types` | regenera `src/types/database.types.ts` — **rode após toda migration** |
| `npm run brand:assets` | regenera `public/brand/` a partir de `assets/` |

`db:push` e `db:types` exigem o Supabase CLI autenticado (`npx supabase login`).

---

## Deploy na Vercel

Importe o repositório e configure:

| Campo | Valor |
|---|---|
| **Root Directory** | `app` ← sem isso o build falha |
| Framework Preset | Vite (detectado) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Variáveis de ambiente (Production + Preview):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Depois do primeiro deploy, **adicione a URL da Vercel em Supabase → Authentication →
URL Configuration → Redirect URLs**. Sem isso a recuperação de senha quebra em
silêncio: o e-mail chega, mas o link não volta para a aplicação.

`app/vercel.json` já traz o rewrite de SPA — sem ele, F5 em `/dashboard` dá 404.

---

## Segurança

**Nunca coloque a `service_role` key no frontend.** Toda variável `VITE_*` é embutida no
bundle e fica pública. A `service_role` ignora toda a RLS. No frontend só entra a
publishable key, que é pública por natureza — quem protege o dado é a RLS.

O RLS se apoia em funções `SECURITY DEFINER` no schema `private`
([20260715090400](./supabase/migrations/20260715090400_private_helpers.sql)). Esse
arquivo documenta quatro regras que **não podem ser quebradas** — cada uma corresponde
a um bug real, incluindo a recursão infinita `42P17` que derruba a maioria dos projetos
Supabase. Leia antes de mexer em qualquer policy.

Após alterar policies, rode o teste de isolamento com dois usuários em filiais
diferentes. Foi ele que pegou um vazamento entre filiais que a revisão de código não
viu: permissão responde *o quê* você pode fazer, nunca *sobre quais linhas*.

---

## Governança do conteúdo

As regras de pontuação seguem literalmente o livro oficial da Nestlé. A plataforma
**não altera regras** — apenas digitaliza (PRD seção 3). Como a Nestlé pode ajustar o
livro durante o ano, critérios, pesos e faixas são **dado parametrizável**
(`criteria.scoring_rule`), nunca código.

### Lacunas conhecidas do catálogo

O PRD não fecha as contas, e o seed preserva isso em vez de mascarar:

- **Capítulo I:** os pontos explícitos somam **44**, não 1.600. Os critérios 1.1.1,
  1.1.2 e 1.2.1 **não têm pontuação** no PRD.
- **Capítulo II:** soma **232**, não 400. A numeração salta de 2.9.3 para 2.11.1 — a
  **seção 2.10 inteira está ausente**.
- **Compliance:** soma 62, e não dá para saber se está dentro dos 400 ou fora.
- Faixas com buracos: o booster OG não cobre 9,91–9,99 / 14,91–14,99 / 19,91–19,99 nem
  exatamente 20,00; o 2.4.1 não cobre 95,00 exato. Registrados em `scoring_rule.gaps`.
- 2.4.3 e 2.4.4 não trazem os percentuais das faixas (inferidos de 2.4.2 — confirmar).

Esses critérios levam `points_pending_review = true` e `max_points` nulo.

**Não preencha esses valores por estimativa.** A fonte é o livro oficial em PDF, e a
conferência precisa preceder o motor de cálculo. O PRD seção 10 trata "práticas de
manipulação de dados" como a penalidade máxima do programa: anula a pontuação e pode
gerar litígio.

---

## Pendências conhecidas

- **Lockup em baixa resolução.** `assets/logo-crescer-brokers.png` tem transparência,
  mas só 323×231. O login o exibe limitado a 260px justamente para não esticar e
  borrar — em telas retina ainda fica levemente suave. Um SVG ou uma exportação maior
  resolve: basta substituir o arquivo em `assets/` e rodar `npm run brand:assets`; o
  componente não muda.
- **Logo Nestlé sem canal alfa.** É branco sobre preto opaco, e depende de
  `mix-blend-mode: screen` para o preto sumir — o que só funciona sobre fundo escuro.
  Um PNG com transparência dispensaria o truque.
- **Wordmark do cabeçalho é tipográfico** (Sora + `+` em lime), não o lockup: reduzido à
  altura de um header de 64px, o PNG de 323px ficaria ilegível. Tipografia escala em
  qualquer tamanho.
- **Uso da marca Nestlé** em produto de terceiro — vale validar com o jurídico.
- **LGPD:** turn-over e admissão/demissão são dados pessoais (PRD seção 7). O RBAC já
  restringe; a política de retenção fica para a Fase 2.
