/*
 * Anexos I a XI, somente leitura. Espelham o livro oficial (ver a Skill
 * livro-crescer-brokers-2026). Sao os roteiros, guias de passos, kits, check
 * lists e a lista de certidoes referenciados pelos criterios.
 */
const ANEXOS: { num: string; serve: string; conteudo: string }[] = [
  { num: 'I', serve: '2.1.1 Turn-over', conteudo: 'Procedimento de recrutamento e seleção; escolaridade mínima por função.' },
  { num: 'II', serve: '2.2.1 Reunião Matinal', conteudo: 'Roteiro cronometrado (7h00–8h00) e regra do PDV simulado.' },
  { num: 'III', serve: '2.2.2 RPS', conteudo: 'Presença obrigatória (10 papéis) e pauta da reunião semanal.' },
  { num: 'IV', serve: '2.2.3 Reunião de Ciclo', conteudo: 'Presença obrigatória (12 papéis) e pauta da reunião mensal.' },
  { num: 'V', serve: '2.4.1 Vendedor NiM', conteudo: 'Guia dos 12 passos da venda + Kit Básico.' },
  { num: 'VI', serve: '2.4.2 Professional Food BRN2', conteudo: 'Guia dos 8 passos + Kit Básico (com touca).' },
  { num: 'VII', serve: '2.4.3 Professional Bebidas BRN8', conteudo: 'Guia dos 9 passos + Kit Básico (com touca).' },
  { num: 'VIII', serve: '2.4.4 Purina Especializado', conteudo: 'Guia dos 9 passos + Kit Básico.' },
  { num: 'IX', serve: '2.5.1 Promotor', conteudo: 'Guia dos 8 passos do promotor + Kit Básico (com espanador).' },
  { num: 'X', serve: '2.8.2 a 2.8.6 Supply Chain', conteudo: 'Check List Supply Chain — 43 itens em 4 pilares (Operação, Distribuição, Qualidade, Gestão & Performance).' },
  { num: 'XI', serve: '2.12.2 Certidões', conteudo: 'Lista das 9 certidões/documentos exigidos, enviados via Forms a cada trimestre.' },
]

export function AnexosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl">Anexos</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Roteiros, guias de passos, kits e check lists referenciados pelos critérios do
          livro. Onze anexos, um por tema.
        </p>
      </div>

      <div className="border-hairline overflow-hidden rounded-xl border bg-white">
        <ul className="divide-hairline divide-y">
          {ANEXOS.map((anexo) => (
            <li key={anexo.num} className="flex gap-4 px-4 py-3">
              <span className="font-display text-brand-blue w-12 shrink-0 text-sm font-bold">
                {anexo.num}
              </span>
              <div className="min-w-0">
                <p className="text-ink text-sm font-medium">{anexo.serve}</p>
                <p className="text-ink-muted mt-0.5 text-sm">{anexo.conteudo}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-ink-muted text-xs">
        O índice do livro cita um tema de SHE (Recomendações de Segurança), mas não há anexo
        próprio — o conteúdo de SHE está no critério 2.8.6, que aponta para o Anexo X.
      </p>
    </div>
  )
}
