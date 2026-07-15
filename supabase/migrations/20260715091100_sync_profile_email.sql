-- Sincroniza public.profiles.email quando auth.users.email muda.
--
-- O DEFEITO
-- handle_new_user() copia o e-mail de auth.users para profiles apenas no
-- INSERT. Trocar o e-mail de um usuario (pelo painel, pela admin API ou pelo
-- proprio fluxo de "alterar e-mail") atualizava so auth.users -- profiles
-- ficava com o valor antigo, para sempre e sem aviso.
--
-- Isso nao e cosmetico. profiles.email e o que a UI mostra, o que vai nos
-- relatorios e o que um auditor le. Um e-mail divergente do usado para
-- autenticar corrompe a trilha de auditoria que o PRD 6.8 exige justamente
-- para defesa em fiscalizacao.
--
-- Flagrado ao trocar o e-mail do administrador: auth.users passou a
-- welder.galvani@grupoarantes.emp.br enquanto profiles seguia com o e-mail
-- anterior.

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Reconcilia linhas que ja divergiram antes deste trigger existir.
-- A comparacao e feita em text: citext vive em `extensions` (ver ...090800) e
-- qualificar o tipo aqui so criaria acoplamento com o schema da extensao.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email::text is distinct from u.email::text;
