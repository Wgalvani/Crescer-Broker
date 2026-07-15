import { HexPattern } from '@/components/brand/HexPattern'
import { Wordmark } from '@/components/brand/BrandLogo'

/*
 * Tela de espera enquanto a sessao e resolvida.
 *
 * Existe para evitar o flash da tela de login: sem ela, quem esta logado ve
 * /login por um instante no F5, antes de getSession() responder.
 */
export function BrandSplash() {
  return (
    <div
      className="from-brand-deep-green to-brand-night-green relative grid min-h-svh place-items-center bg-gradient-to-br"
      role="status"
      aria-live="polite"
    >
      <HexPattern className="text-brand-lime/8" />
      <div className="relative flex flex-col items-center gap-6">
        <Wordmark className="text-2xl" />
        <div
          className="border-brand-lime/30 border-t-brand-lime h-8 w-8 animate-spin rounded-full border-3"
          aria-hidden="true"
        />
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  )
}
