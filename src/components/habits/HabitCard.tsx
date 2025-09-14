import { useState } from 'react'
import { ABILITY_ICONS, ABILITY_NAMES, ABILITY_COLORS } from '../../lib/gameLogic'
import type { AbilityType } from '../../lib/types'
import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { useToast } from '../ui/ToastProvider'

interface Habit {
  id: string
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
  streak_count: number
  completed_today: boolean
  can_complete: boolean
}

interface HabitCardProps {
  habit: Habit
  onComplete: (habitId: string) => Promise<any>
  onEdit?: (habit: Habit) => void
  onDelete?: (habitId: string) => void
  compact?: boolean
}

const HabitCard = ({ 
  habit, 
  onComplete, 
  onEdit, 
  onDelete, 
  compact = false 
}: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleComplete = async () => {
    if (!habit.can_complete || isCompleting) return

    setIsCompleting(true)
    try {
      const result = await onComplete(habit.id)
      if (result?.success) {
        const streakBonus = result.bonusMultiplier > 1 ? ` (${Math.round((result.bonusMultiplier - 1) * 100)}% 스트릭 보너스!)` : ''
        showSuccess(
          '습관 완료! 🎉',
          `+${result.expGained} XP, ${result.newStreak}일 연속 달성${streakBonus}`
        )
      } else if (result?.error) {
        showError('완료 실패', result.error)
      }
    } catch (error) {
      showError('오류 발생', '습관 완료 처리 중 문제가 발생했습니다.')
    } finally {
      setIsCompleting(false)
    }
  }

  const getStreakText = (streak: number) => {
    if (streak === 0) return '시작하세요!'
    if (streak === 1) return '첫 성공!'
    if (streak < 7) return `${streak}일 연속`
    if (streak < 30) return `${streak}일 연속! 🔥`
    return `${streak}일 연속! 🏆`
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆'
    if (streak >= 14) return '🎉'
    if (streak >= 7) return '⭐'
    return '🔥'
  }

  const getStreakMilestone = (streak: number) => {
    if (streak >= 30) return { text: '레전드!', color: 'text-yellow-600' }
    if (streak >= 14) return { text: '대단해요!', color: 'text-purple-600' }
    if (streak >= 7) return { text: '훌륭해요!', color: 'text-blue-600' }
    if (streak >= 3) return { text: '좋아요!', color: 'text-green-600' }
    return { text: '화이팅!', color: 'text-slate-600' }
  }

  if (compact) {
    return (
      <div className={`
        game-card p-4 border-l-4 habit-card-${habit.ability_type}
        ${habit.completed_today ? 'opacity-70' : ''}
        transition-all duration-300
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xl
              bg-ability-${habit.ability_type}-100 text-ability-${habit.ability_type}-600
              dark:bg-ability-${habit.ability_type}-900/20 dark:text-ability-${habit.ability_type}-400
              shadow-md
            `}>
              {ABILITY_ICONS[habit.ability_type]}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-slate-900 dark:text-slate-100 ${
                habit.completed_today ? 'line-through opacity-60' : ''
              }`}>
                {habit.title}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg">{getStreakEmoji(habit.streak_count)}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {getStreakText(habit.streak_count)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {habit.completed_today ? (
              <div className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <span className="text-lg mr-1">✓</span>
                <span className="text-sm font-medium">완료</span>
              </div>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!habit.can_complete || isCompleting}
                loading={isCompleting}
                size="sm"
                ability={habit.ability_type}
                glow
              >
                {isCompleting ? '처리중...' : '완료'}
              </Button>
            )}
          </div>
        </div>

        {/* 간소화된 스트릭 진행도 */}
        {habit.streak_count > 0 && (
          <div className="mt-3">
            <ProgressBar
              value={habit.streak_count}
              max={30}
              ability={habit.ability_type}
              size="sm"
              showLabel={false}
              showPercentage={false}
              striped={habit.streak_count >= 7}
              glow={habit.streak_count >= 14}
            />
          </div>
        )}
      </div>
    )
  }

  const milestone = getStreakMilestone(habit.streak_count)

  return (
    <div 
      className={`
        game-card p-6 relative habit-card-${habit.ability_type}
        ${habit.completed_today ? 'opacity-80' : ''}
        transition-all duration-300 group
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 완료 체크 오버레이 */}
      {habit.completed_today && (
        <div className="absolute inset-0 bg-green-50/90 dark:bg-green-900/20 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-green-600 dark:text-green-400 text-center">
            <div className="text-5xl mb-3 animate-bounce">✓</div>
            <div className="font-bold text-lg">오늘 완료!</div>
            <div className="text-sm opacity-75">+{habit.streak_count >= 7 ? '20' : '10'} XP 획득</div>
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      {showActions && onEdit && onDelete && !habit.completed_today && (
        <div className="absolute top-4 right-4 flex space-x-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={() => onEdit(habit)}
            size="xs"
            variant="outline"
            className="p-2 bg-white/90 dark:bg-slate-800/90"
            game={false}
          >
            ✏️
          </Button>
          <Button
            onClick={() => onDelete(habit.id)}
            size="xs"
            variant="danger"
            className="p-2"
            game={false}
          >
            🗑️
          </Button>
        </div>
      )}

      {/* 능력치 배지 */}
      <div className="flex items-center justify-between mb-4">
        <div className={`
          inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold
          bg-ability-${habit.ability_type}-100 text-ability-${habit.ability_type}-700
          dark:bg-ability-${habit.ability_type}-900/30 dark:text-ability-${habit.ability_type}-300
          border border-ability-${habit.ability_type}-200 dark:border-ability-${habit.ability_type}-700
          shadow-sm
        `}>
          <span className="mr-2 text-lg">{ABILITY_ICONS[habit.ability_type]}</span>
          {ABILITY_NAMES[habit.ability_type]}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">
            {habit.frequency === 'daily' ? '매일' : '주간'}
          </span>
        </div>
      </div>

      {/* 습관 제목 */}
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${
          habit.completed_today 
            ? 'line-through text-slate-500 dark:text-slate-500' 
            : 'text-slate-900 dark:text-slate-100'
        }`}>
          {habit.title}
        </h3>
      </div>

      {/* 스트릭 정보 */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getStreakEmoji(habit.streak_count)}</span>
            <div>
              <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {getStreakText(habit.streak_count)}
              </div>
              <div className={`text-sm font-medium ${milestone.color}`}>
                {milestone.text}
              </div>
            </div>
          </div>
          
          {habit.streak_count >= 7 && (
            <div className="text-center">
              <div className="text-3xl animate-glow">
                {habit.streak_count >= 30 ? '🏆' : habit.streak_count >= 14 ? '🎉' : '⭐'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {habit.streak_count >= 30 ? '레전드' : habit.streak_count >= 14 ? '마스터' : '베테랑'}
              </div>
            </div>
          )}
        </div>
        
        {/* 향상된 스트릭 진행 바 */}
        {habit.streak_count > 0 && (
          <div className="space-y-2">
            <ProgressBar
              value={habit.streak_count}
              max={30}
              ability={habit.ability_type}
              size="md"
              showLabel={false}
              showPercentage={false}
              showValues={true}
              striped={habit.streak_count >= 7}
              glow={habit.streak_count >= 14}
              animated={habit.streak_count >= 21}
            />
            
            {/* 마일스톤 표시 */}
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span className={habit.streak_count >= 3 ? 'text-green-500 font-medium' : ''}>3일</span>
              <span className={habit.streak_count >= 7 ? 'text-blue-500 font-medium' : ''}>7일</span>
              <span className={habit.streak_count >= 14 ? 'text-purple-500 font-medium' : ''}>14일</span>
              <span className={habit.streak_count >= 30 ? 'text-yellow-500 font-medium' : ''}>30일</span>
            </div>
          </div>
        )}
      </div>

      {/* 완료 버튼 섹션 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-2">
          {habit.completed_today ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <span className="text-lg mr-2">✨</span>
              <span className="font-semibold">오늘 완료됨</span>
            </div>
          ) : (
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <span className="text-lg mr-2">⏰</span>
              <span>오늘 아직 미완료</span>
            </div>
          )}
        </div>
        
        {!habit.completed_today && (
          <Button
            onClick={handleComplete}
            disabled={!habit.can_complete || isCompleting}
            loading={isCompleting}
            ability={habit.ability_type}
            size="md"
            glow
          >
            {isCompleting ? '완료 처리중...' : '✓ 완료하기'}
          </Button>
        )}
      </div>

      {/* 보상 미리보기 */}
      {!habit.completed_today && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full text-xs text-slate-600 dark:text-slate-400">
            <span className="mr-1">🎁</span>
            +{habit.streak_count >= 7 ? '20' : '10'} XP
            {habit.streak_count >= 3 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                (+{Math.floor((habit.streak_count / 3) * 10)}% 보너스)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitCard