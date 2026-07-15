/*
 * Traducao das mensagens do Supabase Auth.
 *
 * Regra de seguranca: nenhuma mensagem revela se o e-mail existe. "Invalid
 * login credentials" cobre e-mail inexistente E senha errada, e a traducao
 * mantem essa ambiguidade de proposito -- distinguir os dois casos entrega
 * uma lista de usuarios validos a quem estiver testando.
 */
const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha invalidos.',
  'Email not confirmed': 'Conta ainda nao confirmada. Procure a equipe de TI.',
  'User not found': 'E-mail ou senha invalidos.',
  'Invalid email or password': 'E-mail ou senha invalidos.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'For security purposes, you can only request this after 60 seconds.':
    'Aguarde 60 segundos antes de tentar novamente.',
  'New password should be different from the old password.':
    'A nova senha deve ser diferente da anterior.',
  'Auth session missing!': 'Sessao expirada. Faca login novamente.',
  'Token has expired or is invalid':
    'Este link expirou ou ja foi usado. Solicite um novo.',
}

export function translateAuthError(message: string | undefined): string {
  if (!message) return 'Nao foi possivel concluir. Tente novamente.'

  const exact = MESSAGES[message]
  if (exact) return exact

  if (/rate limit|too many requests/i.test(message)) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  if (/network|fetch failed|failed to fetch/i.test(message)) {
    return 'Sem conexao com o servidor. Verifique sua rede e tente novamente.'
  }

  return 'Nao foi possivel concluir. Tente novamente.'
}
