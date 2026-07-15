import { Outlet } from 'react-router-dom'
import { HexPattern } from '@/components/brand/HexPattern'
import { BrandLockup, NestleMark } from '@/components/brand/BrandLogo'

/*
 * Moldura das telas publicas (login, recuperacao de senha).
 *
 * Fundo verde-escuro com padrao hexagonal, conforme PRD 8.3 -- e a primeira
 * impressao do produto e o que amarra a identidade do programa.
 *
 * Sem o selo Missao 1BI aqui: como marca d'agua ele disputava com o lockup
 * (duas marcas denominativas no mesmo eixo) e nenhuma das duas lia. O tema do
 * ano segue presente no AppLayout, ja dentro da plataforma.
 */
export function AuthLayout() {
  return (
    <div className="from-brand-deep-green to-brand-night-green relative min-h-svh bg-gradient-to-br">
      <HexPattern className="text-brand-lime/10" />

      <div className="relative mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-4 py-12">
        {/* O lockup vem da arte em alta (800px servidos), entao o limite aqui
            nao e mais a resolucao -- o de ~260px era do arquivo antigo, de
            315px. O limite agora e a ALTURA da tela: a coluna e logo + card +
            rodape, e um logo fixo em 400px fazia o login rolar ate num monitor
            de 900px. O 40vh cede em tela baixa e trava em 360px na alta. */}
        <BrandLockup className="mx-auto max-w-[min(360px,40vh)]" />

        <main id="conteudo">
          <Outlet />
        </main>

        <footer className="flex flex-col items-center gap-4">
          <NestleMark className="w-28 opacity-85" />
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
