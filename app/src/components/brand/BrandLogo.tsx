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

/** Lockup oficial do programa. Transparente: vai sobre o verde do login. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/lockup-crescer-brokers.webp"
      alt="CRESCER+BROKERS - Programa de Excelencia Nestle"
      width={646}
      height={442}
      className={cn('h-auto w-full', className)}
    />
  )
}

/**
 * Selo da campanha interna "Missao 1BI: 365 dias de jornada".
 *
 * Marca distinta do CRESCER+BROKERS, em roxo/laranja. Fica deliberadamente
 * discreto e restrito ao rodape do login: no corpo do app ele brigaria com a
 * paleta do programa, que o PRD 8.2 define como verde/azul/lime.
 */
export function SeloMissao1BI({ className }: { className?: string }) {
  return (
    <img
      src="/brand/selo-missao-1bi.webp"
      alt="Crescer+ e Melhor - Missao 1BI: 365 dias de jornada"
      width={192}
      height={237}
      className={cn('h-auto', className)}
    />
  )
}
