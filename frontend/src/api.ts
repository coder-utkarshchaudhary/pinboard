export interface Card {
  id: string
  kind: 'text' | 'file'
  content: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  priority: string
  priority_rank: number
  status: 'todo' | 'done'
  created_at: string
  due_at: string
  completed_at: string | null
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getCards: (status: 'todo' | 'done') =>
    req<Card[]>(`https://pinboard-xmr7.vercel.app/api/cards?status=${status}`),

  createCards: (form: FormData) =>
    req<Card[]>('https://pinboard-xmr7.vercel.app/api/cards', { method: 'POST', body: form }),

  updateCard: (id: string, body: Partial<{ content: string; priority: string; status: 'todo' | 'done' }>) =>
    req<Card>(`https://pinboard-xmr7.vercel.app/api/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  deleteCard: (id: string) =>
    req<{ ok: boolean }>(`https://pinboard-xmr7.vercel.app/api/cards/${id}`, { method: 'DELETE' }),

  getDownloadUrl: (id: string) =>
    req<{ url: string }>(`https://pinboard-xmr7.vercel.app/api/cards/${id}/download`),
}
