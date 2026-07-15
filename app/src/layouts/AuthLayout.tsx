import { Outlet } from 'react-router-dom'
import { HexPattern } from '@/components/brand/HexPattern'
import { BrandLockup, NestleMark, SeloMissao1BI } from '@/components/brand/BrandLogo'

/*
 * Moldura das telas publicas (login, recuperacao de senha).
 *
 * Fundo verde-escuro com padrao hexagonal, conforme PRD 8.3 -- e a primeira
 * impressao do produto e o que amarra a identidade do programa.
 */
export function AuthLayout() {
  return (
    <div className="from-brand-deep-green to-brand-night-green relative min-h-svh bg-gradient-to-br">
      <HexPattern className="text-brand-lime/10" />

      <div className="relative mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-4 py-12">
        {/* 260px, e nao a largura toda: o original tem 323px e esticar so
            renderiza borrado. Trocar o arquivo por um SVG remove o limite. */}
        <BrandLockup className="mx-auto max-w-[260px]" />

        <main id="conteudo">
          <Outlet />
        </main>

        <footer className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-5">
            <NestleMark className="w-20 opacity-70" />
            <span className="h-8 w-px bg-white/15" aria-hidden="true" />
            <SeloMissao1BI className="w-11 opacity-90" />
          </div>
          <p className="text-center text-xs text-white/50">
            Plataforma interna do Grupo Arantes para gestao do programa CRESCER+BROKERS.
            <br />
            Os resultados oficiais sao sempre os publicados pela Nestle.
          </p>
        </footer>
      </div>
    </div>
  )
}
