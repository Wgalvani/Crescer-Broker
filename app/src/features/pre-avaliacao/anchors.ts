/** id de ancora a partir da secao: '2.1' -> 'sec-2-1' (bate com o menu lateral). */
export function sectionAnchor(section: string): string {
  return `sec-${section.replace(/\./g, '-')}`
}
