import type { Department } from '@/features/usuarios/types'
import { DEPARTMENT_OPTIONS } from '@/features/usuarios/types'

type Props = {
  id?: string
  value: Department | ''
  onChange: (value: Department | '') => void
}

/** Seletor de setor (enum department). Vazio = sem setor definido. */
export function DepartmentSelect({ id, value, onChange }: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Department | '')}
      className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
    >
      <option value="">Sem setor</option>
      {DEPARTMENT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
