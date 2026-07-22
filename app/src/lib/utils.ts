import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Iniciais para o avatar do usuario: "Welder Galvani" -> "WG". */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/*
 * Formatadores pt-BR. O livro usa virgula decimal em tudo ("8,0", "70,00%") e
 * ha pontos fracionarios reais (1,25), entao nada aqui pode arredondar para
 * inteiro. Uma casa por padrao cobre os pontos do livro sem inventar precisao.
 */

/** 68 -> "68%", 66.7 -> "67%" (inteiro por padrao; a prontidao nao finge casas). */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}

/** 8 -> "8", 1.25 -> "1,25". Ate 2 casas, sem zeros a direita desnecessarios. */
export function formatPontos(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
