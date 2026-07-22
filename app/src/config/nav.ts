import { LayoutDashboard, Gauge, type LucideIcon } from 'lucide-react'

/*
 * Navegacao lateral.
 *
 * Dois niveis: itens de topo (Dashboard, Gestao a Vista) e GRUPOS DE CAPITULO
 * coloridos, cada um com subitens = as secoes do livro. A cor forte identifica
 * o capitulo; o submenu recebe uma tinta clara do mesmo tom (pedido do usuario).
 *
 * Cores escolhidas dentro do que o index.css permite: o lime reprova AA como
 * texto; vermelho/ambar sao reservados a risco. Por isso Performance=azul,
 * Excelencia=verde da marca, Compliance=ambar (e literalmente o capitulo de
 * risco/desclassificacao) e Anexos=neutro. Item ativo usa a cor forte com texto
 * branco (passa AA); subitem inativo usa texto ink sobre a tinta clara.
 *
 * As secoes espelham o livro oficial (ver a Skill livro-crescer-brokers-2026).
 * Compliance segue a convencao da Skill: capitulo 2.10 com itens 2.11-2.16.
 */

export type NavLeaf = {
  label: string
  /** Rota. Pode conter hash de secao: '/pre-avaliacao/excelencia#sec-2-1'. */
  to: string
}

export type NavTopItem = NavLeaf & {
  icon: LucideIcon
  perm?: string
}

export type ChapterAccent = {
  /** Cor do rotulo do cabecalho do grupo. */
  header: string
  /** Painel do submenu: tinta clara + borda lateral do mesmo tom. */
  panel: string
  /** Subitem ativo: cor forte + texto branco. */
  itemActive: string
  /** Subitem inativo: texto ink + hover na tinta do tom. */
  itemIdle: string
}

export type NavChapter = {
  key: string
  label: string
  /** Pagina base do capitulo (cabecalho aponta pra ca, sem hash). */
  to: string
  /** Permissao exigida. Ausente = qualquer autenticado. */
  perm?: string
  accent: ChapterAccent
  items: NavLeaf[]
}

export const NAV_TOP: NavTopItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Gestão à Vista', to: '/pre-avaliacao', icon: Gauge, perm: 'scoring.read_own' },
]

const ACCENT_PERFORMANCE: ChapterAccent = {
  header: 'text-brand-blue',
  panel: 'border-brand-blue/25 bg-brand-blue/5',
  itemActive: 'bg-brand-blue text-white',
  itemIdle: 'text-ink hover:bg-brand-blue/10',
}

const ACCENT_EXCELENCIA: ChapterAccent = {
  header: 'text-brand-deep-green',
  panel: 'border-brand-deep-green/25 bg-brand-deep-green/5',
  itemActive: 'bg-brand-deep-green text-white',
  itemIdle: 'text-ink hover:bg-brand-deep-green/10',
}

const ACCENT_COMPLIANCE: ChapterAccent = {
  header: 'text-status-warn',
  panel: 'border-status-warn/25 bg-status-warn/5',
  itemActive: 'bg-status-warn text-white',
  itemIdle: 'text-ink hover:bg-status-warn/10',
}

const ACCENT_ANEXOS: ChapterAccent = {
  header: 'text-ink-muted',
  panel: 'border-hairline bg-ink/[0.03]',
  itemActive: 'bg-ink-muted text-white',
  itemIdle: 'text-ink hover:bg-ink/5',
}

export const NAV_CHAPTERS: NavChapter[] = [
  {
    key: 'performance',
    label: 'Capítulo I · Performance',
    to: '/programa/performance',
    perm: 'program.read',
    accent: ACCENT_PERFORMANCE,
    items: [
      { label: '1.1 VBC', to: '/programa/performance#sec-1-1' },
      { label: '1.2 Cobertura', to: '/programa/performance#sec-1-2' },
      { label: '1.3 Sortimento Farma B', to: '/programa/performance#sec-1-3' },
      { label: '1.4 BEES', to: '/programa/performance#sec-1-4' },
      { label: '1.5 Ruptura / Positivação', to: '/programa/performance#sec-1-5' },
    ],
  },
  {
    key: 'excelencia',
    label: 'Capítulo II · Excelência Operacional',
    to: '/pre-avaliacao/excelencia',
    perm: 'scoring.read_own',
    accent: ACCENT_EXCELENCIA,
    items: [
      { label: '2.1 Pessoas', to: '/pre-avaliacao/excelencia#sec-2-1' },
      { label: '2.2 Planejamento de Vendas', to: '/pre-avaliacao/excelencia#sec-2-2' },
      { label: '2.3 Processos de Vendas', to: '/pre-avaliacao/excelencia#sec-2-3' },
      { label: '2.4 Vendedor', to: '/pre-avaliacao/excelencia#sec-2-4' },
      { label: '2.5 Promotor de Vendas', to: '/pre-avaliacao/excelencia#sec-2-5' },
      { label: '2.6 Desenvolvimento da Rota', to: '/pre-avaliacao/excelencia#sec-2-6' },
      { label: '2.7 TI', to: '/pre-avaliacao/excelencia#sec-2-7' },
      { label: '2.8 Supply Chain', to: '/pre-avaliacao/excelencia#sec-2-8' },
      { label: '2.9 Operações Logísticas', to: '/pre-avaliacao/excelencia#sec-2-9' },
    ],
  },
  {
    key: 'compliance',
    label: '2.10 · Itens de Compliance',
    to: '/pre-avaliacao/compliance',
    perm: 'scoring.read_own',
    accent: ACCENT_COMPLIANCE,
    items: [
      { label: '2.11 Verbas em aberto', to: '/pre-avaliacao/compliance#sec-2-11' },
      { label: '2.12 Alvarás e certidões', to: '/pre-avaliacao/compliance#sec-2-12' },
      { label: '2.13 Expedição salvage/bloqueados', to: '/pre-avaliacao/compliance#sec-2-13' },
      { label: '2.14 Transpasse', to: '/pre-avaliacao/compliance#sec-2-14' },
      { label: '2.15 Escrituração', to: '/pre-avaliacao/compliance#sec-2-15' },
      { label: '2.16 Produtos vencidos no PDV', to: '/pre-avaliacao/compliance#sec-2-16' },
    ],
  },
  {
    key: 'anexos',
    label: 'Anexos',
    to: '/programa/anexos',
    perm: 'program.read',
    accent: ACCENT_ANEXOS,
    items: [{ label: 'Anexos I a XI', to: '/programa/anexos' }],
  },
]
