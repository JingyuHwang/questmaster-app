import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  ABILITY_TYPES, 
  ABILITY_NAMES, 
  ABILITY_ICONS, 
  DIFFICULTY_NAMES,
  DIFFICULTY_EXP_REWARDS 
} from '@/lib/gameLogic'
import type { CreateQuestData, QuestDifficulty, AbilityType } from '@/lib/types'

const questSchema = z.object({
  title: z.string().min(1, '퀘스트 제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ability_type: z.enum(['intelligence', 'strength', 'health', 'creativity', 'social']),
  due_date: z.string().optional()
})

type QuestFormData = z.infer<typeof questSchema>

interface QuestFormProps {
  onSubmit: (data: CreateQuestData) => Promise<{ success: boolean; message: string }>
  onCancel?: () => void
  loading?: boolean
  initialData?: Partial<CreateQuestData>
}

export const QuestForm: React.FC<QuestFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    reset
  } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      difficulty: initialData?.difficulty || 'easy',
      ability_type: initialData?.ability_type || 'intelligence',
      title: initialData?.title || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date || ''
    }
  })

  const selectedDifficulty = watch('difficulty')
  const selectedAbility = watch('ability_type')

  const handleFormSubmit = async (data: QuestFormData) => {
    try {
      const result = await onSubmit(data)
      
      if (result.success) {
        reset()
        onCancel?.()
      } else {
        setError('root', { message: result.message })
      }
    } catch (error) {
      setError('root', { 
        message: error instanceof Error ? error.message : '퀘스트 생성 중 오류가 발생했습니다.' 
      })
    }
  }

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    const colors = {
      easy: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      hard: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[difficulty]
  }

  const getAbilityColor = (ability: AbilityType) => {
    const colors = {
      intelligence: 'text-blue-600 bg-blue-50 border-blue-200',
      strength: 'text-red-600 bg-red-50 border-red-200',
      health: 'text-green-600 bg-green-50 border-green-200',
      creativity: 'text-purple-600 bg-purple-50 border-purple-200',
      social: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
    return colors[ability]
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Quest Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Target className="inline w-4 h-4 mr-1" />
          퀘스트 제목
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="예: 30분 운동하기, 책 10페이지 읽기"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Quest Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          퀘스트 설명 (선택사항)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Zap className="inline w-4 h-4 mr-1" />
          난이도 선택
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
            <label
              key={difficulty}
              className={`relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                selectedDifficulty === difficulty
                  ? getDifficultyColor(difficulty)
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                {...register('difficulty')}
                type="radio"
                value={difficulty}
                className="sr-only"
              />
              <div className="font-medium">{DIFFICULTY_NAMES[difficulty]}</div>
              <div className="text-sm text-gray-500">
                {DIFFICULTY_EXP_REWARDS[difficulty]} XP
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Ability Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          능력치 타입
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {ABILITY_TYPES.map((ability) => (
            <label
              key={ability}
              className={`relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                selectedAbility === ability
                  ? getAbilityColor(ability)
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                {...register('ability_type')}
                type="radio"
                value={ability}
                className="sr-only"
              />
              <div className="text-2xl mb-1">{ABILITY_ICONS[ability]}</div>
              <div className="text-sm font-medium">{ABILITY_NAMES[ability]}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          마감일 (선택사항)
        </label>
        <input
          {...register('due_date')}
          type="datetime-local"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-500">{errors.due_date.message}</p>
        )}
      </div>

      {/* Error Message */}
      {errors.root && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
        </div>
      )}

      {/* Quest Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">퀘스트 미리보기</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{ABILITY_ICONS[selectedAbility]}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedDifficulty)}`}>
              {DIFFICULTY_NAMES[selectedDifficulty]}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {DIFFICULTY_EXP_REWARDS[selectedDifficulty]} XP
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {ABILITY_NAMES[selectedAbility]} 능력치 향상
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          퀘스트 생성
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
