import { cn } from '@/lib/utils'

/*
 * Ativos de marca do programa CRESCER+BROKERS.
 *
 * LIMITACAO CONHECIDA DOS ATIVOS ORIGINAIS (assets/):
 *   - logo-crescer-brokers-lockup.png e a arte da CAPA inteira (3000x1688),
 *     com fundo verde e padrao hexagonal chapados na imagem. Nao tem
 *     transparencia, entao nao pode ser colado sobre um fundo qualquer.
 *   - logo-nestle-white.png e branco sobre PRETO OPACO (24bpp, sem canal
 *     alfa).
 *
 * Enquanto nao houver um vetor com transparencia vindo do time de marca:
 *   - o wordmark do cabecalho e TIPOGRAFICO (Sora + "+" em lime), o que
 *     escala em qualquer tamanho e nao carrega fundo junto;
 *   - o logo Nestle usa mix-blend-mode:screen, que faz o preto sumir e o
 *     branco ficar -- funciona apenas sobre fundo escuro.
 *
 * Ao receber o vetor: trocar Wordmark por <img src="/brand/lockup.svg"> e
 * remover o blend de NestleMark. O resto do app nao muda.
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

/** Selo completo (triangulo + wordmark), recortado da arte oficial. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/lockup-crescer-brokers.webp"
      alt="CRESCER+BROKERS - Programa de Excelencia Nestle"
      width={720}
      height={513}
      className={cn('h-auto w-full', className)}
    />
  )
}
