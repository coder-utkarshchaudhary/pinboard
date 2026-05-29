import { useQuery } from '@tanstack/react-query'
import { api, type Card } from '../api'
import CardItem from './Card'

interface Props {
  status: 'todo' | 'done'
}

export default function CardList({ status }: Props) {
  const { data, isLoading, isError, error } = useQuery<Card[]>({
    queryKey: ['cards', status],
    queryFn: () => api.getCards(status),
    refetchInterval: 5000,
  })

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-16 text-sm">Loading…</div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-red-400 py-16 text-sm">
        Failed to load cards: {String(error)}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-600 py-16 text-sm">
        {status === 'todo' ? 'Nothing to do — add a card above.' : 'Nothing archived yet.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  )
}
