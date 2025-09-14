import React from 'react'
import { clsx } from 'clsx'
import type { Achievement, UserAchievement, AvatarRarity } from '../../lib/types'
import { ACHIEVEMENT_CATEGORY_COLORS, ACHIEVEMENT_CATEGORY_NAMES } from '../../lib/achievements/achievementData'
import { ProgressBar } from '../ui/ProgressBar'

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  onClick?: (achievement: Achievement) => void
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userAchievement,
  onClick,
  size = 'md',
  showProgress = true
}) => {
  const isCompleted = userAchievement?.is_completed || false
  const progress = userAchievement?.progress || 0
  
  const rarityGradients: Record<AvatarRarity, string> = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600', 
    legendary: 'from-yellow-400 to-yellow-600',
    mythic: 'from-orange-400 to-orange-600'
  }

  const rarityNames: Record<AvatarRarity, string> = {
    common: '일반',
    rare: '레어',
    epic: '에픽',
    legendary: '전설',
    mythic: '신화'
  }

  const categoryColor = ACHIEVEMENT_CATEGORY_COLORS[achievement.category]

  const sizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <div
      className={clsx(
        'game-card relative overflow-hidden transition-all duration-300 cursor-pointer',
        sizes[size],
        {
          'opacity-50 grayscale': !isCompleted && achievement.hidden,
          'hover:scale-105': onClick,
          'ring-2 ring-yellow-400 ring-opacity-75': isCompleted,
          [`hover:shadow-xl hover:shadow-${categoryColor}-500/20`]: true
        }
      )}
      onClick={() => onClick?.(achievement)}
    >
      {/* 등급별 배경 효과 */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-10',
        rarityGradients[achievement.rarity]
      )} />

      {/* 완료 표시 */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-green-500 text-white text-xs font-bold p-2 rounded-full shadow-lg animate-pulse">
            ✓
          </div>
        </div>
      )}

      {/* 등급 배지 */}
      <div className="absolute top-2 left-2 z-10">
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-bold text-white shadow-md',
          `bg-gradient-to-r ${rarityGradients[achievement.rarity]}`
        )}>
          {rarityNames[achievement.rarity]}
        </div>
      </div>

      {/* 카테고리 배지 */}
      <div className="absolute top-2 right-2 z-10">
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium',
          `bg-${categoryColor}-100 text-${categoryColor}-700`,
          `dark:bg-${categoryColor}-900/20 dark:text-${categoryColor}-300`
        )}>
          {ACHIEVEMENT_CATEGORY_NAMES[achievement.category]}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3 pt-6">
        {/* 아이콘 */}
        <div className={clsx(
          'relative',
          iconSizes[size],
          {
            'animate-glow': achievement.rarity === 'legendary' || achievement.rarity === 'mythic',
            'grayscale': !isCompleted && progress < 100
          }
        )}>
          {achievement.icon}
        </div>

        {/* 제목 및 설명 */}
        <div className="text-center space-y-1">
          <h3 className={clsx(
            'font-bold text-slate-900 dark:text-slate-100',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg',
            {
              'line-through opacity-60': !isCompleted && achievement.hidden
            }
          )}>
            {achievement.hidden && !isCompleted ? '???' : achievement.title}
          </h3>
          
          <p className={clsx(
            'text-slate-600 dark:text-slate-400',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {achievement.hidden && !isCompleted ? 
              '숨겨진 업적입니다' : 
              achievement.description
            }
          </p>

          {/* 보상 경험치 */}
          <div className="flex items-center justify-center space-x-1 text-xs">
            <span className="text-green-600 dark:text-green-400">+{achievement.reward_exp}</span>
            <span className="text-slate-500 dark:text-slate-400">XP</span>
          </div>
        </div>

        {/* 진행도 바 */}
        {showProgress && !isCompleted && !achievement.hidden && (
          <div className="w-full space-y-1">
            <ProgressBar
              value={progress}
              max={100}
              color={categoryColor as any}
              size="sm"
              showLabel={false}
              showPercentage={true}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {progress}% 완료
            </p>
          </div>
        )}

        {/* 완료 표시 */}
        {isCompleted && (
          <div className="w-full">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2 text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                🎉 달성 완료!
              </p>
              {userAchievement?.unlocked_at && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 희귀도별 파티클 효과 */}
      {(achievement.rarity === 'legendary' || achievement.rarity === 'mythic') && isCompleted && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"></div>
          <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle delay-150"></div>
          <div className="absolute bottom-3 left-4 w-1 h-1 bg-yellow-500 rounded-full animate-sparkle delay-300"></div>
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle delay-75"></div>
        </div>
      )}
    </div>
  )
}