import React from 'react'
import { QuestList } from '@/components/quests/QuestList'

export const Quests: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <QuestList />
    </div>
  )
}
