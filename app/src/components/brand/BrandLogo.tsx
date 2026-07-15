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
 * O mesmo selo como marca d'agua de fundo -- o tema do ano com presenca, sem
 * disputar com o lockup.
 *
 * O `mix-blend-mode: luminosity` e o que torna isto possivel: ele toma a
 * LUMINANCIA do selo e a COR do fundo, entao o desenho aparece inteiro mas
 * assume a paleta da tela. Sem ele, o roxo/laranja da campanha vira um anel
 * amarronzado sobre o verde do programa (PRD 8.2) e suja a tela -- testado.
 * Como a cor deixa de brigar, da para dobrar a opacidade e o selo fica maior e
 * mais nitido do que ficaria colorido.
 *
 * aria-hidden: e decoracao pura, e o texto do selo nao acrescenta nada que a
 * tela ja nao diga.
 */
export function SeloMissao1BIWatermark({
  className,
  imgClassName,
}: {
  className?: string
  imgClassName?: string
}) {
  return (
    // Sem z-index e sem position:fixed aqui, de proposito: os dois criam
    // stacking context, o que ISOLA o mix-blend-mode e faz o selo voltar a
    // exibir roxo/laranja. A sobreposicao correta vem da ordem no DOM -- o
    // conteudo, que vem depois e e `relative`, pinta por cima.
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 grid place-items-center overflow-hidden',
        className
      )}
    >
      <img
        src="/brand/selo-missao-1bi.webp"
        alt=""
        className={cn(
          'h-auto w-[min(560px,88vw)] opacity-[0.18] mix-blend-luminosity',
          imgClassName
        )}
      />
    </div>
  )
}
