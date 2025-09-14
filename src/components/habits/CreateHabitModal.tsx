import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ABILITY_TYPES, ABILITY_ICONS, ABILITY_NAMES } from '../../lib/gameLogic'
import type { AbilityType } from '../../lib/types'

interface CreateHabitData {
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
}

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateHabitData) => Promise<any>
  initialData?: CreateHabitData
  mode?: 'create' | 'edit'
}

const CreateHabitModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create'
}: CreateHabitModalProps) => {
  const [formData, setFormData] = useState<CreateHabitData>({
    title: '',
    ability_type: 'intelligence',
    frequency: 'daily'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        title: '',
        ability_type: 'intelligence',
        frequency: 'daily'
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '습관 제목을 입력해주세요'
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '제목은 최소 2글자 이상이어야 합니다'
    } else if (formData.title.trim().length > 50) {
      newErrors.title = '제목은 50글자 이하로 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        ...formData,
        title: formData.title.trim()
      })

      if (result.error) {
        setErrors({ submit: result.error })
      } else {
        onClose()
      }
    } catch (error) {
      setErrors({ submit: '습관 저장 중 오류가 발생했습니다' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateHabitData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 습관 예시 제안
  const getHabitSuggestions = (abilityType: AbilityType): string[] => {
    const suggestions = {
      intelligence: ['30분 독서하기', '새로운 단어 5개 학습', '온라인 강의 1시간 듣기', '뉴스 기사 3개 읽기'],
      strength: ['30분 운동하기', '스쿠어트 50개', '산책 30분', '계단 오르기'],
      health: ['물 2L 마시기', '비타민 챙겨먹기', '11시 전에 잠자리에 들기', '명상 10분'],
      creativity: ['그림 그리기', '일기 쓰기', '새로운 요리 시도하기', '악기 연습 30분'],
      social: ['가족과 대화하기', '친구에게 안부 묻기', '새로운 사람과 대화', '감사 인사 전하기']
    }
    return suggestions[abilityType] || []
  }

  const currentSuggestions = getHabitSuggestions(formData.ability_type)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '새로운 습관 만들기' : '습관 수정하기'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 습관 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            습관 제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="예: 매일 30분 독서하기"
            className={`
              w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.title ? 'border-red-300' : 'border-gray-300'}
            `}
            maxLength={50}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <div className="mt-1 text-sm text-gray-500">
            {formData.title.length}/50
          </div>
        </div>

        {/* 능력치 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            연관 능력치 *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ABILITY_TYPES.map((ability) => (
              <button
                key={ability}
                type="button"
                onClick={() => handleInputChange('ability_type', ability)}
                className={`
                  flex items-center p-3 rounded-lg border-2 transition-all
                  ${formData.ability_type === ability
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <span className="text-xl mr-3">{ABILITY_ICONS[ability]}</span>
                <div className="text-left">
                  <div className="font-medium">{ABILITY_NAMES[ability]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 빈도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            실행 빈도 *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('frequency', 'daily')}
              className={`
                flex items-center justify-center p-4 rounded-lg border-2 transition-all
                ${formData.frequency === 'daily'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="font-medium">매일</div>
                <div className="text-sm text-gray-500">일일 습관</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('frequency', 'weekly')}
              className={`
                flex items-center justify-center p-4 rounded-lg border-2 transition-all
                ${formData.frequency === 'weekly'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">주간</div>
                <div className="text-sm text-gray-500">주별 습관</div>
              </div>
            </button>
          </div>
        </div>

        {/* 습관 예시 제안 */}
        {currentSuggestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              💡 {ABILITY_NAMES[formData.ability_type]} 관련 추천 습관
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('title', suggestion)}
                  className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'create' ? '습관 만들기' : '수정하기'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateHabitModal
