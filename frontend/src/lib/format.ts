export function formatDue(dueAt: string): { label: string; overdue: boolean } {
  const now = Date.now()
  const due = new Date(dueAt).getTime()
  const diffMs = due - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const overdue = diffMs < 0

  if (overdue) {
    const days = Math.floor(-diffMs / (1000 * 60 * 60 * 24))
    const label = days === 0 ? 'Due today (overdue)' : `${days}d overdue`
    return { label, overdue: true }
  }
  if (diffDays === 0) return { label: 'Due today', overdue: false }
  if (diffDays === 1) return { label: 'Due tomorrow', overdue: false }
  return { label: `Due in ${diffDays}d`, overdue: false }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
