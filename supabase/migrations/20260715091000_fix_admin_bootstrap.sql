-- Correcao de deadlock de bootstrap no trigger anti-escalacao.
--
-- O DEFEITO
-- prevent_admin_self_grant() barrava a concessao do papel `admin` sempre que
-- private.is_admin() fosse falso. Acontece que is_admin() se apoia em
-- auth.uid(), que e NULO fora de uma sessao de usuario -- ou seja, em toda
-- operacao de backend (service_role, Edge Function, migration, painel).
--
-- Resultado: o papel `admin` nao podia ser concedido por NINGUEM. Nem pelo
-- primeiro provisionamento, que precisa rodar justamente sem sessao. O sistema
-- ficava sem administrador para sempre, e a UI de gestao de usuarios (PRD
-- 6.11) inalcancavel. Flagrado ao criar o primeiro usuario real: HTTP 403.
--
-- A CORRECAO
-- A barreira existe contra ESCALACAO DE PRIVILEGIO -- um usuario logado com
-- users.manage se auto-promovendo a admin. Esse cenario pressupoe uma sessao.
-- Sem sessao, quem chama e o backend com service_role, que ja ignora toda a
-- RLS por definicao; bloquea-lo aqui nao acrescenta seguranca nenhuma e so
-- quebra o provisionamento.
--
-- Entao: a checagem passa a valer apenas quando HA sessao de usuario.

create or replace function public.prevent_admin_self_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role_key text;
begin
  select r.key into v_role_key
  from public.roles r
  where r.id = new.role_id;

  -- auth.uid() nulo = contexto de backend (service_role / migration), confiavel.
  -- Com sessao, so um admin concede o papel admin.
  if v_role_key = 'admin'
     and (select auth.uid()) is not null
     and not private.is_admin() then
    raise exception 'Somente um administrador pode conceder o papel "admin".'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_admin_self_grant() from public, anon, authenticated;
