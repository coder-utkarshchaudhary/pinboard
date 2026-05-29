import { useQueryClient } from '@tanstack/react-query'
import { type Card } from '../api'

interface Props {
  active: 'todo' | 'done'
  onSelect: (tab: 'todo' | 'done') => void
}

export default function Tabs({ active, onSelect }: Props) {
  const qc = useQueryClient()
  const todoData = qc.getQueryData<Card[]>(['cards', 'todo'])
  const doneData = qc.getQueryData<Card[]>(['cards', 'done'])
  const todoCount = todoData?.length ?? 0
  const doneCount = doneData?.length ?? 0

  const tab = (id: 'todo' | 'done', label: string, count: number) => (
    <button
      onClick={() => onSelect(id)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        active === id
          ? 'bg-gray-900 text-gray-100 border-b-2 border-blue-500'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${active === id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="flex border-b border-gray-800 mb-4">
      {tab('todo', 'To Do', todoCount)}
      {tab('done', 'Done', doneCount)}
    </div>
  )
}
