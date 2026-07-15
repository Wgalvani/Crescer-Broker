import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'

type SessionState = {
  session: Session | null
  /** true enquanto a sessao inicial nao foi resolvida. */
  loading: boolean
}

export const SessionContext = createContext<SessionState>({
  session: null,
  loading: true,
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)

      // Nada de supabase.* SINCRONO aqui dentro: este callback roda segurando
      // o lock interno do auth, e chamar o cliente de volta trava tudo. O
      // setTimeout(0) joga o trabalho para fora do lock.
      setTimeout(() => {
        // Sem isto, o cache do TanStack Query sobrevive a troca de usuario e o
        // proximo login enxerga dados do anterior -- vazamento entre tenants.
        if (!nextSession) queryClient.clear()
      }, 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>
  )
}
