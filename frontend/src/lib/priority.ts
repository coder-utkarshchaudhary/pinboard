export type Priority = 'very_low' | 'low' | 'medium' | 'high'

export const PRIORITY_LABELS: Record<Priority, string> = {
  very_low: 'Very Low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const PRIORITY_DAYS: Record<Priority, number> = {
  very_low: 5,
  low: 3,
  medium: 2,
  high: 1,
}

export const PRIORITY_RANK: Record<Priority, number> = {
  very_low: 1,
  low: 2,
  medium: 3,
  high: 4,
}

export const PRIORITY_ORDER: Priority[] = ['very_low', 'low', 'medium', 'high']

export const PRIORITY_BADGE: Record<Priority, string> = {
  very_low: 'bg-gray-700 text-gray-300',
  low: 'bg-blue-900 text-blue-200',
  medium: 'bg-amber-900 text-amber-200',
  high: 'bg-red-900 text-red-200',
}
