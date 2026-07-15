import { cn } from '@/lib/utils'

/*
 * Ativos de marca.
 *
 * Estado dos originais em assets/:
 *   - logo-crescer-brokers.png     323x231, COM transparencia. E o lockup
 *                                  oficial usado no login.
 *   - selo-missao-1bi.png          1500x1500, com transparencia. Campanha
 *                                  interna, marca distinta (roxo/laranja).
 *   - logo-nestle-white.png        branco sobre PRETO OPACO, sem canal alfa.
 *   - logo-crescer-brokers-lockup.png  arte da capa inteira (3000x1688), sem
 *                                  transparencia. Nao usado -- mantido como
 *                                  referencia da fonte oficial.
 *
 * Dois contornos seguem necessarios:
 *   - o logo Nestle usa mix-blend-mode:screen para o preto sumir; so funciona
 *     sobre fundo escuro. Um PNG com alfa dispensaria o blend.
 *   - o wordmark do cabecalho e TIPOGRAFICO (Sora + "+" em lime): o lockup
 *     tem 323px de largura e ficaria borrado reduzido a altura de um header.
 *     Tipografia escala em qualquer tamanho.
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
 * Logo Nestle. Depende de fundo escuro: o `screen` so anula o preto do PNG
 * porque o resultado com um fundo claro seria um retangulo lavado.
 */
export function NestleMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-nestle-white.png"
      alt="Nestle"
      width={120}
      height={39}
      className={cn('h-auto mix-blend-screen', className)}
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
