import { useState } from 'react'
import Composer from './components/Composer'
import Tabs from './components/Tabs'
import CardList from './components/CardList'

export default function App() {
  const [tab, setTab] = useState<'todo' | 'done'>('todo')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-gray-100 font-semibold text-lg tracking-tight">📌 Pinboard</h1>
      </header>

      <Composer />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pb-16">
        <Tabs active={tab} onSelect={setTab} />
        <CardList status={tab} />
      </main>
    </div>
  )
}
