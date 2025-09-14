import React from 'react'
import { clsx } from 'clsx'
import type { Avatar, AvatarRarity } from '../../lib/types'
import { 
  getAvatarImageUrl, 
  getAvatarRarityClass, 
  getAvatarBorderStyle,
  calculateUnlockProgress 
} from '../../lib/avatars/avatarUtils'
import { AVATAR_RARITY_NAMES } from '../../lib/avatars/avatarData'
import { ProgressBar } from '../ui/ProgressBar'

interface AvatarCardProps {
  avatar: Avatar
  isUnlocked: boolean
  isEquipped?: boolean
  userStats?: any
  onSelect?: (avatar: Avatar) => void
  onEquip?: (avatar: Avatar) => void
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  clickable?: boolean
}

export const AvatarCard: React.FC<AvatarCardProps> = ({
  avatar,
  isUnlocked,
  isEquipped = false,
  userStats,
  onSelect,
  onEquip,
  size = 'md',
  showProgress = true,
  clickable = true
}) => {
  const progressValue = userStats ? calculateUnlockProgress(avatar, userStats) : 0
  
  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  }

  const cardSizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const handleClick = () => {
    if (!clickable) return
    
    if (isUnlocked && onEquip) {
      onEquip(avatar)
    } else if (onSelect) {
      onSelect(avatar)
    }
  }

  const getRarityGradient = (rarity: AvatarRarity) => {
    const gradients = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600', 
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600',
      mythic: 'from-orange-400 to-orange-600'
    }
    return gradients[rarity]
  }

  return (
    <div className={clsx(
      'game-card relative overflow-hidden transition-all duration-300',
      cardSizes[size],
      {
        'cursor-pointer hover:scale-105': clickable,
        'opacity-50': !isUnlocked,
        'ring-4 ring-yellow-400 ring-opacity-75': isEquipped,
        [`hover:shadow-xl ${getAvatarRarityClass(avatar.rarity)}`]: isUnlocked
      }
    )}
    onClick={handleClick}
    >
      {/* 등급별 배경 효과 */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-10',
        getRarityGradient(avatar.rarity)
      )} />

      {/* 장착 중 표시 */}
      {isEquipped && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            장착중
          </div>
        </div>
      )}

      {/* 등급 배지 */}
      <div className="absolute top-2 left-2 z-10">
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-bold text-white shadow-md',
          `bg-gradient-to-r ${getRarityGradient(avatar.rarity)}`
        )}>
          {AVATAR_RARITY_NAMES[avatar.rarity]}
        </div>
      </div>

      {/* 아바타 이미지 */}
      <div className="flex flex-col items-center space-y-3">
        <div className={clsx(
          'relative rounded-full overflow-hidden',
          sizes[size],
          getAvatarBorderStyle(avatar.rarity),
          {
            'grayscale': !isUnlocked,
            'animate-glow': avatar.rarity === 'legendary' || avatar.rarity === 'mythic'
          }
        )}>
          <img
            src={getAvatarImageUrl(avatar)}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
          
          {/* 언락 오버레이 */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-2xl">🔒</div>
            </div>
          )}
        </div>

        {/* 아바타 정보 */}
        <div className="text-center space-y-1">
          <h3 className={clsx(
            'font-bold text-slate-900 dark:text-slate-100',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          )}>
            {avatar.name}
          </h3>
          
          <p className={clsx(
            'text-slate-600 dark:text-slate-400',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            Lv.{avatar.level_required}+
          </p>

          {/* 능력치 특화 표시 */}
          {avatar.ability_type && (
            <div className={clsx(
              'inline-block px-2 py-1 rounded-full text-xs font-medium',
              `bg-ability-${avatar.ability_type}-100 text-ability-${avatar.ability_type}-700`,
              `dark:bg-ability-${avatar.ability_type}-900/20 dark:text-ability-${avatar.ability_type}-300`
            )}>
              {avatar.ability_type === 'intelligence' ? '지능' :
               avatar.ability_type === 'strength' ? '체력' :
               avatar.ability_type === 'health' ? '건강' :
               avatar.ability_type === 'creativity' ? '창의성' : '사회성'}
            </div>
          )}
        </div>

        {/* 언락 진행도 */}
        {!isUnlocked && showProgress && userStats && (
          <div className="w-full space-y-2">
            <ProgressBar
              value={progressValue}
              max={100}
              color={avatar.ability_type ? avatar.ability_type as any : 'blue'}
              size="sm"
              showLabel={false}
              showPercentage={true}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {avatar.unlock_condition.description}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        {isUnlocked && !isEquipped && clickable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEquip?.(avatar)
            }}
            className={clsx(
              'w-full py-2 px-3 rounded-lg font-medium text-white transition-all duration-200',
              `bg-gradient-to-r ${getRarityGradient(avatar.rarity)}`,
              'hover:shadow-lg transform hover:scale-105'
            )}
          >
            장착하기
          </button>
        )}
      </div>

      {/* 희귀도별 파티클 효과 */}
      {(avatar.rarity === 'legendary' || avatar.rarity === 'mythic') && isUnlocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"></div>
          <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle delay-150"></div>
          <div className="absolute bottom-3 left-4 w-1 h-1 bg-yellow-500 rounded-full animate-sparkle delay-300"></div>
        </div>
      )}
    </div>
  )
}