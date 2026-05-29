import { useRef, useState, DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { type Priority } from '../lib/priority'
import PrioritySelect from './PrioritySelect'
import { formatFileSize } from '../lib/format'

export default function Composer() {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [priority, setPriority] = useState<Priority>('medium')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (form: FormData) => api.createCards(form),
    onSuccess: () => {
      setText('')
      setFiles([])
      qc.invalidateQueries({ queryKey: ['cards', 'todo'] })
    },
  })

  function addFiles(incoming: File[]) {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...incoming.filter((f) => !names.has(f.name))]
    })
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed && files.length === 0) return
    const form = new FormData()
    if (trimmed) form.append('text', trimmed)
    form.append('priority', priority)
    files.forEach((f) => form.append('files', f))
    mutation.mutate(form)
  }

  const canSubmit = (text.trim() !== '' || files.length > 0) && !mutation.isPending

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4">
      <div
        className={`w-full max-w-[min(50vw,640px)] min-w-[320px] flex flex-col gap-3 bg-gray-900 border-2 rounded-xl p-5 transition-colors ${
          dragging ? 'border-blue-500 bg-gray-800' : 'border-gray-700'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to get done? (or drop files below)"
          rows={3}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed"
        />

        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center gap-1.5 bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-300"
              >
                <span className="max-w-[160px] truncate">{f.name}</span>
                <span className="text-gray-500">{formatFileSize(f.size)}</span>
                <button
                  onClick={() => removeFile(f.name)}
                  className="text-gray-500 hover:text-red-400 ml-1 leading-none"
                  type="button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-400 hover:text-blue-400 border border-gray-600 hover:border-blue-500 rounded px-2.5 py-1 transition-colors"
            >
              + Attach files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
            />
            <PrioritySelect value={priority} onChange={setPriority} disabled={mutation.isPending} />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
          >
            {mutation.isPending ? 'Adding…' : 'Add'}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-red-400 text-xs">{String(mutation.error)}</p>
        )}

        {dragging && (
          <p className="text-center text-blue-400 text-sm py-2">Drop files here</p>
        )}
      </div>
    </div>
  )
}
