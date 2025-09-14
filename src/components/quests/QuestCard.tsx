import React, { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit, 
  MoreVertical,
  AlertCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  ABILITY_ICONS, 
  ABILITY_NAMES, 
  DIFFICULTY_NAMES
} from '@/lib/gameLogic'
import type { Quest } from '@/lib/types'

interface QuestCardProps {
  quest: Quest
  onComplete?: (questId: string) => Promise<void>
  onEdit?: (quest: Quest) => void
  onDelete?: (questId: string) => Promise<void>
  loading?: boolean
  compact?: boolean
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onComplete,
  onEdit,
  onDelete,
  loading = false,
  compact = false
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleComplete = async () => {
    if (!onComplete || quest.status === 'completed') return
    
    setIsCompleting(true)
    try {
      await onComplete(quest.id)
    } catch (error) {
      console.error('퀘스트 완료 처리 중 오류:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm('정말로 이 퀘스트를 삭제하시겠습니까?')) {
      setIsDeleting(true)
      try {
        await onDelete(quest.id)
      } catch (error) {
        console.error('퀘스트 삭제 중 오류:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getDifficultyStyle = () => {
    const styles = {
      easy: 'border-l-green-400 bg-green-50 dark:bg-green-900/20',
      medium: 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      hard: 'border-l-red-400 bg-red-50 dark:bg-red-900/20'
    }
    return styles[quest.difficulty]
  }

  const getDifficultyTextColor = () => {
    const colors = {
      easy: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      hard: 'text-red-600 dark:text-red-400'
    }
    return colors[quest.difficulty]
  }

  const isOverdue = quest.due_date && quest.status === 'active' && 
                   new Date(quest.due_date) < new Date()

  const isCompleted = quest.status === 'completed'
  const isFailed = quest.status === 'failed'

  return (
    <div className={`
      relative game-card transition-all duration-300
      ${compact ? 'p-3 border-l-2' : 'p-4 border-l-4'}
      ${isCompleted ? 'opacity-75 bg-gray-50 dark:bg-gray-800/50' : getDifficultyStyle()}
      ${loading ? 'pointer-events-none opacity-50' : 'hover:shadow-lg hover:scale-[1.02]'}
      ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
    `}>
      {/* Quest Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {/* Ability Icon */}
          <div className="text-2xl flex-shrink-0">
            {ABILITY_ICONS[quest.ability_type]}
          </div>
          
          {/* Quest Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
              isCompleted ? 'line-through' : ''
            }`}>
              {quest.title}
            </h3>
            
            <div className="flex items-center space-x-2 mt-1">
              {/* Difficulty Badge */}
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${getDifficultyTextColor()} bg-current bg-opacity-10
              `}>
                {DIFFICULTY_NAMES[quest.difficulty]}
              </span>
              
              {/* Ability Type */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {ABILITY_NAMES[quest.ability_type]}
              </span>
              
              {/* EXP Reward */}
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {quest.exp_reward} XP
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {!compact && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                {onEdit && !isCompleted && (
                  <button
                    onClick={() => {
                      onEdit(quest)
                      setShowActions(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit size={14} />
                    <span>수정</span>
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowActions(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                    <span>삭제</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quest Description */}
      {quest.description && !compact && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {quest.description}
        </p>
      )}

      {/* Quest Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          {/* Created Date */}
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>
              {format(new Date(quest.created_at), 'MM/dd', { locale: ko })}
            </span>
          </div>
          
          {/* Due Date */}
          {quest.due_date && (
            <div className={`flex items-center space-x-1 ${
              isOverdue ? 'text-red-500 dark:text-red-400' : ''
            }`}>
              <Calendar size={12} />
              <span>
                {format(new Date(quest.due_date), 'MM/dd HH:mm', { locale: ko })}
              </span>
              {isOverdue && <AlertCircle size={12} />}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center space-x-1">
          {isCompleted && (
            <>
              <CheckCircle size={12} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400">완료</span>
            </>
          )}
          {isFailed && (
            <>
              <AlertCircle size={12} className="text-red-500" />
              <span className="text-red-600 dark:text-red-400">실패</span>
            </>
          )}
          {isOverdue && quest.status === 'active' && (
            <>
              <AlertCircle size={12} className="text-red-500" />
              <span className="text-red-600 dark:text-red-400">기한 초과</span>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      {quest.status === 'active' && onComplete && (
        <Button
          onClick={handleComplete}
          loading={isCompleting}
          className="w-full"
          variant="primary"
          size={compact ? "xs" : "sm"}
        >
          <CheckCircle size={compact ? 14 : 16} className="mr-2" />
          {compact ? '완료' : '퀘스트 완료'}
        </Button>
      )}

      {/* Completed Info */}
      {isCompleted && quest.completed_at && !compact && (
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            <CheckCircle size={16} className="inline mr-1" />
            {format(new Date(quest.completed_at), 'MM월 dd일 HH:mm', { locale: ko })}에 완료
          </p>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}
