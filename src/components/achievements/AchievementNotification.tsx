import React, { useEffect } from 'react'
import { clsx } from 'clsx'
import type { Achievement } from '../../lib/types'
import { Button } from '../ui/Button'

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // 애니메이션 시간과 맞춤
  }

  const getRarityClass = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'border-gray-400 bg-gray-50 shadow-gray-500/25'
      case 'rare':
        return 'border-blue-400 bg-blue-50 shadow-blue-500/25'
      case 'epic':
        return 'border-purple-400 bg-purple-50 shadow-purple-500/25'
      case 'legendary':
        return 'border-yellow-400 bg-yellow-50 shadow-yellow-500/50 animate-pulse'
      case 'mythic':
        return 'border-orange-400 bg-orange-50 shadow-orange-500/50 animate-pulse'
      default:
        return 'border-gray-400 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* 배경 오버레이 */}
      <div 
        className={clsx(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isVisible && !isClosing ? 'opacity-30' : 'opacity-0'
        )}
      />

      {/* 알림 카드 */}
      <div
        className={clsx(
          'relative max-w-md w-full pointer-events-auto',
          'transform transition-all duration-500 ease-out',
          {
            'translate-y-0 opacity-100 scale-100': isVisible && !isClosing,
            '-translate-y-8 opacity-0 scale-95': !isVisible || isClosing
          }
        )}
      >
        <div className={clsx(
          'bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-4 p-6',
          'relative overflow-hidden',
          getRarityClass()
        )}>
          {/* 장식적 배경 요소들 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          
          {/* 파티클 효과 (전설/신화 등급) */}
          {(achievement.rarity === 'legendary' || achievement.rarity === 'mythic') && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"></div>
              <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle delay-150"></div>
              <div className="absolute bottom-3 left-4 w-1 h-1 bg-yellow-500 rounded-full animate-sparkle delay-300"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle delay-75"></div>
              <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-sparkle delay-225"></div>
            </div>
          )}

          {/* 헤더 */}
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-game">
              업적 달성!
            </h2>
          </div>

          {/* 업적 정보 */}
          <div className="text-center space-y-4">
            {/* 아이콘 */}
            <div className="relative">
              <div className="text-5xl animate-level-up">
                {achievement.icon}
              </div>
              
              {/* 등급 표시 */}
              <div className="absolute -top-2 -right-2">
                <div className={clsx(
                  'px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg',
                  {
                    'bg-gray-500': achievement.rarity === 'common',
                    'bg-blue-500': achievement.rarity === 'rare',
                    'bg-purple-500': achievement.rarity === 'epic',
                    'bg-yellow-500': achievement.rarity === 'legendary',
                    'bg-orange-500': achievement.rarity === 'mythic'
                  }
                )}>
                  {achievement.rarity === 'common' ? '일반' :
                   achievement.rarity === 'rare' ? '레어' :
                   achievement.rarity === 'epic' ? '에픽' :
                   achievement.rarity === 'legendary' ? '전설' : '신화'}
                </div>
              </div>
            </div>

            {/* 제목 */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {achievement.title}
            </h3>

            {/* 설명 */}
            <p className="text-slate-600 dark:text-slate-400">
              {achievement.description}
            </p>

            {/* 언락 메시지 */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <p className="text-green-700 dark:text-green-300 font-medium">
                {achievement.unlock_message}
              </p>
            </div>

            {/* 보상 */}
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-green-600 dark:text-green-400 font-bold">
                  +{achievement.reward_exp}
                </span>
                <span className="text-slate-500 dark:text-slate-400">XP</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleClose}
              variant="primary"
              size="md"
              glow
            >
              확인
            </Button>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// 업적 달성 알림을 관리하는 컨텍스트와 훅
import { createContext, useContext, useState, ReactNode } from 'react'

interface AchievementNotificationContextType {
  showAchievement: (achievement: Achievement) => void
  hideAchievement: () => void
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | null>(null)

export const AchievementNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)

  const showAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement)
  }

  const hideAchievement = () => {
    setCurrentAchievement(null)
  }

  return (
    <AchievementNotificationContext.Provider value={{ showAchievement, hideAchievement }}>
      {children}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={hideAchievement}
        />
      )}
    </AchievementNotificationContext.Provider>
  )
}

export const useAchievementNotification = () => {
  const context = useContext(AchievementNotificationContext)
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider')
  }
  return context
}