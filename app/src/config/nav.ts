import {
  LayoutDashboard,
  Gauge,
  TrendingUp,
  Award,
  ShieldCheck,
  Paperclip,
  type LucideIcon,
} from 'lucide-react'

/*
 * Navegacao lateral.
 *
 * Dois niveis: itens de topo (Dashboard, Gestao a Vista) e GRUPOS DE CAPITULO,
 * cada um com cor propria e subitens = as secoes do livro. Cada subitem tem um
 * NUMERO (badge) e um nome: "2.1" (Excelencia) e "2.11" (Compliance) sao topicos
 * diferentes e o badge colorido por capitulo evita a confusao.
 *
 * Cores dentro do que o index.css permite (lime reprova AA como texto; a
 * excecao e lime como PREENCHIMENTO com texto ink por cima, que passa). Por isso
 * cada capitulo tem uma familia: Performance=azul, Excelencia=verde+lime,
 * Compliance=ambar (o proprio capitulo de risco), Anexos=neutro. Item ativo usa
 * a cor forte; badge ativo fica solido; texto sempre com contraste AA.
 *
 * Secoes conferidas contra a Skill livro-crescer-brokers-2026. Compliance segue
 * a convencao da Skill: capitulo 2.10 (indice) com itens 2.11-2.16 (corpo).
 */

export type NavTopItem = {
  label: string
  to: string
  icon: LucideIcon
  perm?: string
}

export type ChapterItem = {
  /** Numero da secao, exibido em badge: '2.1', '2.11'. */
  num: string
  label: string
  /** Rota com hash de secao: '/pre-avaliacao/excelencia#sec-2-1'. */
  to: string
}

export type ChapterAccent = {
  icon: LucideIcon
  /** Espinha colorida do card (border-l-4). */
  spine: string
  /** Cor do rotulo do capitulo. */
  label: string
  /** Fundo tenue do cabecalho do card. */
  headerBg: string
  /** Chip do icone (preenchido, forte). */
  iconChip: string
  /** Linha do subitem ativo (preenchida). */
  itemActive: string
  /** Linha do subitem inativo (com hover). */
  itemIdle: string
  /** Badge do numero quando ativo. */
  numActive: string
  /** Badge do numero quando inativo. */
  numIdle: string
}

export type NavChapter = {
  key: string
  label: string
  /** Pagina base do capitulo (cabecalho aponta pra ca, sem hash). */
  to: string
  perm?: string
  accent: ChapterAccent
  items: ChapterItem[]
}

export const NAV_TOP: NavTopItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Gestão à Vista', to: '/pre-avaliacao', icon: Gauge, perm: 'scoring.read_own' },
]

const ACCENT_PERFORMANCE: ChapterAccent = {
  icon: TrendingUp,
  spine: 'border-brand-blue',
  label: 'text-brand-blue',
  headerBg: 'bg-brand-blue/6',
  iconChip: 'bg-brand-blue text-white',
  itemActive: 'bg-brand-blue text-white shadow-sm',
  itemIdle: 'text-ink hover:bg-brand-blue/8',
  numActive: 'bg-white/20 text-white',
  numIdle: 'bg-brand-blue/12 text-brand-blue',
}

// Familia verde/lime da marca. Lime so aparece como PREENCHIMENTO com texto ink
// por cima (AA ~11:1); como texto sobre branco reprovaria.
const ACCENT_EXCELENCIA: ChapterAccent = {
  icon: Award,
  spine: 'border-brand-lime',
  label: 'text-brand-deep-green',
  headerBg: 'bg-brand-lime/10',
  iconChip: 'bg-brand-lime text-ink',
  itemActive: 'bg-brand-lime text-ink shadow-sm',
  itemIdle: 'text-ink hover:bg-brand-lime/15',
  numActive: 'bg-ink/15 text-ink',
  numIdle: 'bg-brand-lime/25 text-brand-deep-green',
}

// Ambar: o proprio capitulo de risco/desclassificacao (index.css reserva ambar
// para semantica de risco/compliance), entao a cor e coerente, nao decoracao.
const ACCENT_COMPLIANCE: ChapterAccent = {
  icon: ShieldCheck,
  spine: 'border-status-warn',
  label: 'text-status-warn',
  headerBg: 'bg-status-warn/8',
  iconChip: 'bg-status-warn text-white',
  itemActive: 'bg-status-warn text-white shadow-sm',
  itemIdle: 'text-ink hover:bg-status-warn/8',
  numActive: 'bg-white/20 text-white',
  numIdle: 'bg-status-warn/12 text-status-warn',
}

const ACCENT_ANEXOS: ChapterAccent = {
  icon: Paperclip,
  spine: 'border-ink-muted',
  label: 'text-ink-muted',
  headerBg: 'bg-ink/4',
  iconChip: 'bg-ink-muted text-white',
  itemActive: 'bg-ink-muted text-white shadow-sm',
  itemIdle: 'text-ink hover:bg-ink/5',
  numActive: 'bg-white/25 text-white',
  numIdle: 'bg-ink/8 text-ink-muted',
}

export const NAV_CHAPTERS: NavChapter[] = [
  {
    key: 'performance',
    label: 'Capítulo I · Performance',
    to: '/programa/performance',
    perm: 'program.read',
    accent: ACCENT_PERFORMANCE,
    items: [
      { num: '1.1', label: 'VBC', to: '/programa/performance#sec-1-1' },
      { num: '1.2', label: 'Cobertura', to: '/programa/performance#sec-1-2' },
      { num: '1.3', label: 'Sortimento Farma B', to: '/programa/performance#sec-1-3' },
      { num: '1.4', label: 'BEES', to: '/programa/performance#sec-1-4' },
      { num: '1.5', label: 'Ruptura / Positivação', to: '/programa/performance#sec-1-5' },
    ],
  },
  {
    key: 'excelencia',
    label: 'Capítulo II · Excelência Operacional',
    to: '/pre-avaliacao/excelencia',
    perm: 'scoring.read_own',
    accent: ACCENT_EXCELENCIA,
    items: [
      { num: '2.1', label: 'Pessoas', to: '/pre-avaliacao/excelencia#sec-2-1' },
      { num: '2.2', label: 'Planejamento de Vendas', to: '/pre-avaliacao/excelencia#sec-2-2' },
      { num: '2.3', label: 'Processos de Vendas', to: '/pre-avaliacao/excelencia#sec-2-3' },
      { num: '2.4', label: 'Vendedor', to: '/pre-avaliacao/excelencia#sec-2-4' },
      { num: '2.5', label: 'Promotor de Vendas', to: '/pre-avaliacao/excelencia#sec-2-5' },
      { num: '2.6', label: 'Desenvolvimento da Rota', to: '/pre-avaliacao/excelencia#sec-2-6' },
      { num: '2.7', label: 'TI', to: '/pre-avaliacao/excelencia#sec-2-7' },
      { num: '2.8', label: 'Supply Chain', to: '/pre-avaliacao/excelencia#sec-2-8' },
      { num: '2.9', label: 'Operações Logísticas', to: '/pre-avaliacao/excelencia#sec-2-9' },
    ],
  },
  {
    key: 'compliance',
    label: '2.10 · Itens de Compliance',
    to: '/pre-avaliacao/compliance',
    perm: 'scoring.read_own',
    accent: ACCENT_COMPLIANCE,
    items: [
      { num: '2.11', label: 'Verbas em aberto', to: '/pre-avaliacao/compliance#sec-2-11' },
      { num: '2.12', label: 'Alvarás e certidões', to: '/pre-avaliacao/compliance#sec-2-12' },
      { num: '2.13', label: 'Expedição salvage/bloqueados', to: '/pre-avaliacao/compliance#sec-2-13' },
      { num: '2.14', label: 'Transpasse', to: '/pre-avaliacao/compliance#sec-2-14' },
      { num: '2.15', label: 'Escrituração', to: '/pre-avaliacao/compliance#sec-2-15' },
      { num: '2.16', label: 'Produtos vencidos no PDV', to: '/pre-avaliacao/compliance#sec-2-16' },
    ],
  },
  {
    key: 'anexos',
    label: 'Anexos',
    to: '/programa/anexos',
    perm: 'program.read',
    accent: ACCENT_ANEXOS,
    items: [{ num: 'I–XI', label: 'Roteiros, kits e certidões', to: '/programa/anexos' }],
  },
]
