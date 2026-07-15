import { Link, useRouteError } from 'react-router-dom'

function Shell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh place-items-center px-4">
      <div className="border-hairline max-w-md rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-ink text-xl">{title}</h1>
        <div className="text-ink-muted mt-2 text-sm">{children}</div>
        <Link
          to="/dashboard"
          className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-6 inline-block rounded-lg px-4 py-2.5 text-sm font-bold"
        >
          Ir para o inicio
        </Link>
      </div>
    </div>
  )
}

export function ForbiddenPage() {
  return (
    <Shell title="Acesso nao autorizado">
      Seu perfil nao tem permissao para este modulo. Se precisa deste acesso, procure a
      equipe de TI.
    </Shell>
  )
}

export function NotFoundPage() {
  return <Shell title="Pagina nao encontrada">O endereco acessado nao existe.</Shell>
}

export function ErrorPage() {
  const error = useRouteError()
  // Mensagem tecnica so no console: a tela nao expoe detalhe interno.
  console.error(error)

  return (
    <Shell title="Algo deu errado">
      Nao foi possivel carregar esta tela. Tente novamente; se persistir, procure a
      equipe de TI.
    </Shell>
  )
}
