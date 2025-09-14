import { useState } from 'react'
import HabitCard from './HabitCard'
import CreateHabitModal from './CreateHabitModal'
import { Button } from '../ui/Button'
import type { AbilityType } from '../../lib/types'

interface Habit {
  id: string
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
  streak_count: number
  completed_today: boolean
  can_complete: boolean
}

interface HabitListProps {
  habits: Habit[]
  loading: boolean
  onComplete: (habitId: string) => Promise<any>
  onCreate: (habitData: any) => Promise<any>
  onUpdate: (habitId: string, updates: any) => Promise<any>
  onDelete: (habitId: string) => Promise<any>
  showCreateButton?: boolean
  compact?: boolean
  filterBy?: 'all' | 'daily' | 'weekly' | 'today' | 'completed'
  title?: string
}

const HabitList = ({ 
  habits, 
  loading,
  onComplete,
  onCreate,
  onUpdate,
  onDelete,
  showCreateButton = true,
  compact = false,
  filterBy = 'all',
  title
}: HabitListProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [filter, setFilter] = useState(filterBy)

  // 습관 필터링
  const getFilteredHabits = () => {
    switch (filter) {
      case 'daily':
        return habits.filter(habit => habit.frequency === 'daily')
      case 'weekly':
        return habits.filter(habit => habit.frequency === 'weekly')
      case 'today':
        return habits.filter(habit => habit.frequency === 'daily' && !habit.completed_today)
      case 'completed':
        return habits.filter(habit => habit.completed_today)
      default:
        return habits
    }
  }

  const filteredHabits = getFilteredHabits()

  // 통계 정보
  const todayHabits = habits.filter(h => h.frequency === 'daily')
  const completedTodayCount = habits.filter(h => h.completed_today && h.frequency === 'daily').length
  const totalDailyCount = todayHabits.length

  const handleCreate = async (habitData: any) => {
    const result = await onCreate(habitData)
    if (result.error === null) {
      setShowCreateModal(false)
    }
    return result
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowCreateModal(true)
  }

  const handleUpdate = async (habitData: any) => {
    if (!editingHabit) return

    const result = await onUpdate(editingHabit.id, habitData)
    if (result.success) {
      setShowCreateModal(false)
      setEditingHabit(null)
    }
    return result
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingHabit(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>}
          
          {/* 오늘의 진행도 */}
          {filter === 'all' && totalDailyCount > 0 && (
            <div className="text-sm text-gray-600">
              오늘 진행도: <span className="font-medium text-blue-600">
                {completedTodayCount}/{totalDailyCount}
              </span>
              {completedTodayCount === totalDailyCount && totalDailyCount > 0 && (
                <span className="ml-2">🎉 완료!</span>
              )}
            </div>
          )}
        </div>

        {showCreateButton && (
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="md"
          >
            + 습관 추가
          </Button>
        )}
      </div>

      {/* 필터 탭 */}
      {!compact && filterBy === 'all' && (
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: '전체' },
            { key: 'today', label: `오늘 할 일 (${habits.filter(h => h.frequency === 'daily' && !h.completed_today).length})` },
            { key: 'daily', label: '매일' },
            { key: 'weekly', label: '주간' },
            { key: 'completed', label: `완료됨 (${completedTodayCount})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 습관 목록 */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {filter === 'today' ? '오늘 할 일이 없습니다!' :
             filter === 'completed' ? '아직 완료한 습관이 없습니다.' :
             '아직 습관이 없습니다.'}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'today' ? '모든 일일 습관을 완료했거나 아직 설정하지 않으셨습니다.' :
             filter === 'completed' ? '습관을 완료하면 여기에 표시됩니다.' :
             '새로운 습관을 만들어 성장을 시작해보세요!'}
          </p>
          {showCreateButton && filter !== 'completed' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
            >
              첫 번째 습관 만들기
            </Button>
          )}
        </div>
      ) : (
        <div className={`
          grid gap-4 
          ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
        `}>
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={onComplete}
              onEdit={handleEdit}
              onDelete={onDelete}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* 습관 생성/수정 모달 */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={editingHabit ? handleUpdate : handleCreate}
        initialData={editingHabit ? {
          title: editingHabit.title,
          ability_type: editingHabit.ability_type,
          frequency: editingHabit.frequency
        } : undefined}
        mode={editingHabit ? 'edit' : 'create'}
      />
    </div>
  )
}

export default HabitList
