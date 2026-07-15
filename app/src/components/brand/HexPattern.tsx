import { cn } from '@/lib/utils'

/*
 * Padrao hexagonal da identidade do programa (PRD 8.3).
 *
 * SVG inline, e nao um recorte da arte da capa: escala sem serrilhar em
 * qualquer viewport, e tintavel por currentColor e pesa ~1 KB -- a tela de
 * login precisa abrir em 3G/4G instavel (PRD secao 7).
 */
export function HexPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    >
      <defs>
        <pattern
          id="hex"
          width="56"
          height="97"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.6)"
        >
          {/* Dois hexagonos deslocados fecham o tesselamento sem emenda. */}
          <path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0 48 L28 64 L28 97 M56 48 L28 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  )
}
