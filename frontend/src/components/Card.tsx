import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Card, api } from '../api'
import { PRIORITY_LABELS, PRIORITY_BADGE, type Priority } from '../lib/priority'
import { formatDue, formatDate, formatFileSize } from '../lib/format'
import PrioritySelect from './PrioritySelect'

interface Props {
  card: Card
}

export default function CardItem({ card }: Props) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(card.content ?? '')
  const [editPriority, setEditPriority] = useState<Priority>(card.priority as Priority)
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['cards', 'todo'] })
    qc.invalidateQueries({ queryKey: ['cards', 'done'] })
  }

  const updateMut = useMutation({
    mutationFn: (body: Parameters<typeof api.updateCard>[1]) =>
      api.updateCard(card.id, body),
    onSuccess: invalidate,
  })

  const deleteMut = useMutation({
    mutationFn: () => api.deleteCard(card.id),
    onSuccess: invalidate,
  })

  const downloadMut = useMutation({
    mutationFn: () => api.getDownloadUrl(card.id),
    onSuccess: ({ url }) => window.open(url, '_blank'),
  })

  const { label: dueLabel, overdue } = formatDue(card.due_at)

  const borderClass =
    card.status === 'done'
      ? 'border-green-800'
      : overdue
      ? 'border-red-500'
      : 'border-yellow-400'

  function saveEdit() {
    const updates: Parameters<typeof api.updateCard>[1] = {}
    if (card.kind === 'text' && editText.trim() !== card.content) {
      updates.content = editText.trim()
    }
    if (editPriority !== card.priority) {
      updates.priority = editPriority
    }
    if (Object.keys(updates).length > 0) {
      updateMut.mutate(updates)
    }
    setEditing(false)
  }

  function handleDelete() {
    if (!confirm('Delete this card?')) return
    deleteMut.mutate()
  }

  return (
    <div className={`bg-gray-900 border-2 ${borderClass} rounded-xl p-4 flex flex-col gap-3`}>
      {/* Content */}
      <div className="flex-1">
        {card.kind === 'text' ? (
          editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 text-gray-100 rounded p-2 text-sm resize-none focus:outline-none focus:border-blue-500 border border-gray-600"
              autoFocus
            />
          ) : (
            <p className="text-gray-100 text-sm whitespace-pre-wrap">{card.content}</p>
          )
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-2xl select-none">📎</div>
            <div>
              <p className="text-gray-100 text-sm font-medium">{card.file_name}</p>
              {card.file_size != null && (
                <p className="text-gray-500 text-xs">{formatFileSize(card.file_size)}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {editing ? (
          <PrioritySelect value={editPriority} onChange={setEditPriority} />
        ) : (
          <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_BADGE[card.priority as Priority]}`}>
            {PRIORITY_LABELS[card.priority as Priority]}
          </span>
        )}
        <span className="text-gray-500">Created {formatDate(card.created_at)}</span>
        <span className={overdue && card.status === 'todo' ? 'text-red-400 font-medium' : 'text-gray-400'}>
          {card.status === 'done' && card.completed_at
            ? `Done ${formatDate(card.completed_at)}`
            : dueLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white rounded px-2.5 py-1 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setEditText(card.content ?? ''); setEditPriority(card.priority as Priority) }}
              className="text-xs text-gray-400 hover:text-gray-200 border border-gray-600 rounded px-2.5 py-1 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {card.status === 'todo' ? (
              <button
                onClick={() => updateMut.mutate({ status: 'done' })}
                disabled={updateMut.isPending}
                className="text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded px-2.5 py-1 transition-colors"
              >
                Mark done
              </button>
            ) : (
              <button
                onClick={() => updateMut.mutate({ status: 'todo' })}
                disabled={updateMut.isPending}
                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded px-2.5 py-1 transition-colors"
              >
                Reopen
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-gray-200 border border-gray-600 hover:border-gray-400 rounded px-2.5 py-1 transition-colors"
            >
              Edit
            </button>
            {card.kind === 'file' && (
              <button
                onClick={() => downloadMut.mutate()}
                disabled={downloadMut.isPending}
                className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 rounded px-2.5 py-1 transition-colors disabled:opacity-50"
              >
                Download
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="text-xs text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 rounded px-2.5 py-1 transition-colors disabled:opacity-50 ml-auto"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
