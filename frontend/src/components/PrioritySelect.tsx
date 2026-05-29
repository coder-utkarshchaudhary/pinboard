import { PRIORITY_LABELS, PRIORITY_ORDER, type Priority } from '../lib/priority'

interface Props {
  value: Priority
  onChange: (p: Priority) => void
  disabled?: boolean
}

export default function PrioritySelect({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      disabled={disabled}
      className="bg-gray-800 border border-gray-600 text-gray-100 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
    >
      {[...PRIORITY_ORDER].reverse().map((p) => (
        <option key={p} value={p}>
          {PRIORITY_LABELS[p]}
        </option>
      ))}
    </select>
  )
}
