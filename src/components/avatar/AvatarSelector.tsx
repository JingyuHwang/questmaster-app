import React, { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AvatarCard } from './AvatarCard'
import type { Avatar, AvatarRarity, UserAvatar } from '../../lib/types'
import { AVATARS, AVATAR_RARITY_NAMES } from '../../lib/avatars/avatarData'
import { 
  sortAvatars, 
  calculateCollectionStats 
} from '../../lib/avatars/avatarUtils'

interface AvatarSelectorProps {
  isOpen: boolean
  onClose: () => void
  userStats: any
  userAvatars: UserAvatar[]
  currentAvatarId?: string
  onAvatarEquip: (avatarId: string) => Promise<void>
}

type FilterType = 'all' | 'unlocked' | 'locked' | AvatarRarity
type SortType = 'rarity' | 'level' | 'name'

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  userStats,
  userAvatars,
  currentAvatarId,
  onAvatarEquip
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('level')
  const [isEquipping, setIsEquipping] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)

  // 언락된 아바타 ID 세트
  const unlockedAvatarIds = useMemo(() => 
    new Set(userAvatars.map(ua => ua.avatar_id)), 
    [userAvatars]
  )

  // 컬렉션 통계
  const collectionStats = useMemo(() => 
    calculateCollectionStats(userAvatars, AVATARS),
    [userAvatars]
  )

  // 필터링된 아바타 목록
  const filteredAvatars = useMemo(() => {
    let filtered = AVATARS

    switch (filter) {
      case 'unlocked':
        filtered = AVATARS.filter(avatar => unlockedAvatarIds.has(avatar.id))
        break
      case 'locked':
        filtered = AVATARS.filter(avatar => !unlockedAvatarIds.has(avatar.id))
        break
      case 'all':
        break
      default:
        // 등급별 필터
        filtered = AVATARS.filter(avatar => avatar.rarity === filter)
    }

    return sortAvatars(filtered, sortBy)
  }, [filter, sortBy, unlockedAvatarIds])

  const handleAvatarEquip = async (avatar: Avatar) => {
    if (!unlockedAvatarIds.has(avatar.id) || isEquipping) return

    setIsEquipping(true)
    try {
      await onAvatarEquip(avatar.id)
    } finally {
      setIsEquipping(false)
    }
  }

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: '전체', count: AVATARS.length },
    { value: 'unlocked', label: '보유', count: collectionStats.totalUnlocked },
    { value: 'locked', label: '미보유', count: AVATARS.length - collectionStats.totalUnlocked },
    ...Object.entries(collectionStats.statsByRarity).map(([rarity, stats]) => ({
      value: rarity as AvatarRarity,
      label: AVATAR_RARITY_NAMES[rarity as AvatarRarity],
      count: stats.total
    }))
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎭 아바타 컬렉션"
      size="2xl"
      variant="game"
    >
      <div className="space-y-6">
        {/* 컬렉션 통계 */}
        <div className="game-card p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                컬렉션 진행도
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {collectionStats.totalUnlocked} / {collectionStats.totalAvatars} 수집 완료
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {collectionStats.completionPercentage}%
              </div>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${collectionStats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === option.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="level">레벨순</option>
            <option value="rarity">등급순</option>
            <option value="name">이름순</option>
          </select>
        </div>

        {/* 아바타 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto scrollbar-hide">
          {filteredAvatars.map(avatar => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              isUnlocked={unlockedAvatarIds.has(avatar.id)}
              isEquipped={avatar.id === currentAvatarId}
              userStats={userStats}
              onSelect={setSelectedAvatar}
              onEquip={handleAvatarEquip}
              size="md"
              showProgress={true}
            />
          ))}
        </div>

        {filteredAvatars.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-600 dark:text-slate-400">
              해당하는 아바타가 없습니다.
            </p>
          </div>
        )}

        {/* 아바타 상세 정보 (선택된 경우) */}
        {selectedAvatar && (
          <div className="game-card p-4 border-l-4 border-blue-400">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AvatarCard
                  avatar={selectedAvatar}
                  isUnlocked={unlockedAvatarIds.has(selectedAvatar.id)}
                  isEquipped={selectedAvatar.id === currentAvatarId}
                  size="sm"
                  showProgress={false}
                  clickable={false}
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedAvatar.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedAvatar.description}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  언락 조건: {selectedAvatar.unlock_condition.description}
                </div>
                {unlockedAvatarIds.has(selectedAvatar.id) && selectedAvatar.id !== currentAvatarId && (
                  <Button
                    onClick={() => handleAvatarEquip(selectedAvatar)}
                    disabled={isEquipping}
                    loading={isEquipping}
                    size="sm"
                    variant="primary"
                    glow
                  >
                    장착하기
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  )
}