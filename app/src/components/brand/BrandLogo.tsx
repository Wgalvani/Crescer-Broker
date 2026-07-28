import { cn } from '@/lib/utils'

/*
 * Ativos de marca.
 *
 * Estado dos originais em assets/ (todos com transparencia):
 *   - logo-crescer-brokers.png     323x231. Lockup oficial, usado no login.
 *   - logo-nestle.png              600x600, marca em PRETO. A versao branca e
 *                                  gerada no build a partir do alfa dele.
 *   - selo-missao-1bi.png          1500x1500. Campanha interna, marca distinta
 *                                  (roxo/laranja) -- so no rodape do login.
 *   - logo-crescer-brokers-lockup.png  arte da capa inteira (3000x1688), sem
 *                                  transparencia. Nao usado -- mantido como
 *                                  referencia da fonte oficial.
 *
 * Um contorno segue necessario: o wordmark do cabecalho e TIPOGRAFICO (Sora +
 * "+" em lime). O lockup tem 323px de largura e ficaria borrado reduzido a
 * altura de um header de 64px; tipografia escala em qualquer tamanho.
 */

/** Wordmark tipografico para o cabecalho. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display text-lg leading-none font-extrabold tracking-tight text-white',
        className
      )}
    >
      CRESCER<span className="text-brand-lime">+</span>BROKERS
    </span>
  )
}

/**
 * Logo Nestle em branco, com transparencia real.
 *
 * Sem mix-blend-mode: a versao branca e gerada no build (ver
 * scripts/optimize-brand-assets.mjs), entao o PNG ja tem alfa e funciona sobre
 * qualquer fundo. A versao anterior era branco sobre preto opaco e dependia de
 * `mix-blend-mode: screen`, que so anulava o preto sobre fundo escuro -- e
 * ainda assim deixava a marca com aspecto lavado.
 */
export function NestleMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-nestle-white.png"
      alt="Nestle"
      width={480}
      height={122}
      className={cn('h-auto', className)}
    />
  )
}

/**
 * Lockup oficial do programa, extraido da arte de capa em alta resolucao (ver
 * scripts/optimize-brand-assets.mjs).
 *
 * SO use sobre o verde escuro do tema: bordas e sombras vem compostas sobre o
 * verde da arte, e nao transparentes -- sobre fundo claro aparece um halo.
 *
 * width/height sao o tamanho REAL do arquivo servido (800x562). O valor
 * anterior, 646x442, era uma proporcao errada (1,462 em vez de 1,425) para um
 * arquivo que na pratica saia com 315x221: o browser reservava a altura errada
 * e a tela saltava ao carregar.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/lockup-crescer-brokers.webp"
      alt="CRESCER+BROKERS - Programa de Excelencia Nestle"
      width={800}
      height={562}
      className={cn('h-auto w-full', className)}
    />
  )
}

/**
 * Selo da campanha interna "Missao 1BI: 365 dias de jornada" -- tema do ano da
 * empresa. Marca distinta do CRESCER+BROKERS, em roxo/laranja.
 */
export function SeloMissao1BI({ className }: { className?: string }) {
  return (
    <img
      src="/brand/selo-missao-1bi.webp"
      alt="Crescer+ e Melhor - Missao 1BI: 365 dias de jornada"
      width={512}
      height={631}
      className={cn('h-auto', className)}
    />
  )
}

/**
 * O selo do ano como marca d'agua discreta, ancorada a DIREITA da janela.
 *
 * `fixed inset-y-0 right-0`: gruda na borda direita do viewport e acompanha o
 * scroll, sempre centralizado na vertical da TELA (nao do documento, que e alto
 * e jogaria o selo para o meio da pagina). z-0 o mantem atras do conteudo
 * (`relative z-10`) e do cabecalho (`z-50`).
 *
 * `grayscale`: o selo original e roxo/laranja e brigaria com o verde do
 * programa. Neutralizado e a 6% de opacidade, vira textura de canto -- presente,
 * sem competir com numeros e semaforos (contraste AA do PRD secao 7 preservado,
 * ja que os cards sao brancos e opacos por cima). Trocou o mix-blend-luminosity
 * anterior, que exigia o selo centralizado e sem stacking context proprio.
 *
 * aria-hidden: decoracao pura; o texto do selo nao acrescenta nada a tela.
 */
export function SeloMissao1BIWatermark({
  side = 'right',
  className,
  imgClassName,
}: {
  /** Lado da janela onde o selo fica ancorado. */
  side?: 'left' | 'right'
  className?: string
  imgClassName?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-y-0 z-0 flex items-center overflow-hidden',
        side === 'right' ? 'right-0 justify-end pr-4 lg:pr-10' : 'left-0 justify-start pl-4 lg:pl-10',
        className
      )}
    >
      <img
        src="/brand/selo-missao-1bi.webp"
        alt=""
        className={cn('h-auto w-[min(340px,32vw)] opacity-[0.06] grayscale', imgClassName)}
      />
    </div>
  )
}
