-- Correcao de dois achados do Security Advisor apos o primeiro db push.
--
-- 1. FUNCOES DE TRIGGER EXPOSTAS COMO RPC
--    Toda funcao em `public` fica automaticamente exposta pelo PostgREST em
--    /rest/v1/rpc/<nome>. As funcoes de trigger nao foram escritas para serem
--    chamadas assim -- e duas delas sao SECURITY DEFINER, o que significa que
--    o `anon` poderia invoca-las com privilegio de dono.
--
--    Na pratica o Postgres barra ("trigger functions can only be called as
--    triggers"), mas depender desse acidente e frageil: qualquer refatoracao
--    que transforme uma delas em funcao comum abre o buraco de verdade.
--
--    Revogar EXECUTE nao quebra os triggers: a permissao de funcao de trigger
--    e verificada na criacao do trigger, nao a cada disparo.
--
-- 2. citext NO SCHEMA public
--    A migration ...090000 rodou `create extension citext` sem `with schema`,
--    e ele caiu em `public` (o pgcrypto ja existia em `extensions` e por isso
--    passou batido). Isso despeja ~40 funcoes do citext na API publica.
--    O bloco abaixo e condicional para funcionar tanto neste banco (move)
--    quanto num banco novo criado do zero (nao faz nada).

-- ---------------------------------------------------------------------------
-- 1. Funcoes de trigger: fora da API
-- ---------------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_admin_self_grant() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.prevent_system_role_delete() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. citext para o schema extensions
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'citext' and n.nspname = 'public'
  ) then
    execute 'alter extension citext set schema extensions';
  end if;
end
$$;
