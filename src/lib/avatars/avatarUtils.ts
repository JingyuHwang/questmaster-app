// 아바타 관련 유틸리티 함수들
import type { Avatar, UserAvatar, AvatarRarity, AvatarCollectionStats } from '../types'

// 아바타 이미지 URL 생성
export const getAvatarImageUrl = (avatar: Avatar): string => {
  // 실제 구현시에는 CDN URL 또는 로컬 이미지 경로를 반환
  // 현재는 placeholder 이미지 사용
  const placeholderColors = {
    common: 'gray',
    rare: 'blue', 
    epic: 'purple',
    legendary: 'yellow',
    mythic: 'orange'
  }
  
  const color = placeholderColors[avatar.rarity] || 'gray'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=${color}&color=fff&size=128&bold=true`
}

// 등급별 스타일 클래스
export const getAvatarRarityClass = (rarity: AvatarRarity): string => {
  const classes = {
    common: 'hover:shadow-gray-300',
    rare: 'hover:shadow-blue-300 hover:shadow-lg',
    epic: 'hover:shadow-purple-300 hover:shadow-lg', 
    legendary: 'hover:shadow-yellow-300 hover:shadow-xl',
    mythic: 'hover:shadow-orange-300 hover:shadow-xl'
  }
  return classes[rarity]
}

// 등급별 테두리 스타일
export const getAvatarBorderStyle = (rarity: AvatarRarity): string => {
  const styles = {
    common: 'border-2 border-gray-300',
    rare: 'border-2 border-blue-400 shadow-lg',
    epic: 'border-3 border-purple-400 shadow-lg',
    legendary: 'border-4 border-yellow-400 shadow-xl',
    mythic: 'border-4 border-orange-400 shadow-xl'
  }
  return styles[rarity]
}

// 컬렉션 통계 계산
export const calculateCollectionStats = (userAvatars: UserAvatar[], allAvatars: Avatar[]): AvatarCollectionStats => {
  const unlockedIds = new Set(userAvatars.map(ua => ua.avatar_id))
  const unlockedAvatars = allAvatars.filter(avatar => unlockedIds.has(avatar.id))
  
  const total = allAvatars.length
  const unlocked = unlockedAvatars.length
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0
  
  const statsByRarity = allAvatars.reduce((acc, avatar) => {
    const rarity = avatar.rarity
    if (!acc[rarity]) {
      acc[rarity] = { total: 0, unlocked: 0 }
    }
    acc[rarity].total++
    
    if (unlockedIds.has(avatar.id)) {
      acc[rarity].unlocked++
    }
    
    return acc
  }, {} as Record<AvatarRarity, { total: number; unlocked: number }>)
  
  return {
    total,
    unlocked,
    percentage,
    totalUnlocked: unlocked,
    totalAvatars: total,
    completionPercentage: percentage,
    statsByRarity,
    unlockedAvatars
  }
}

// 현재 장착한 아바타 가져오기
export const getEquippedAvatar = (userAvatars: UserAvatar[], allAvatars: Avatar[]): Avatar | null => {
  const equippedUserAvatar = userAvatars.find(ua => ua.is_equipped)
  if (!equippedUserAvatar) {
    // 기본 아바타 반환
    return allAvatars.find(a => a.id === 'starter') || allAvatars[0] || null
  }
  
  return allAvatars.find(a => a.id === equippedUserAvatar.avatar_id) || null
}

// 추천 아바타 가져오기 (다음 목표)
export const getRecommendedAvatar = (
  userStats: {
    level: number
    intelligence: number
    strength: number
    health: number
    creativity: number
    social: number
    completed_quests: number
    max_streak: number
    achievements: any[]
  },
  userAvatars: UserAvatar[],
  allAvatars: Avatar[]
): Avatar | null => {
  const unlockedIds = new Set(userAvatars.map(ua => ua.avatar_id))
  const lockedAvatars = allAvatars.filter(avatar => !unlockedIds.has(avatar.id))
  
  // 언락 가능한 아바타 중 조건에 가장 가까운 것 찾기
  const sortedByProgress = lockedAvatars
    .map(avatar => {
      const progress = calculateUnlockProgress(avatar, userStats)
      return { avatar, progress }
    })
    .filter(({ progress }) => progress > 0)
    .sort((a, b) => b.progress - a.progress)
  
  return sortedByProgress.length > 0 ? sortedByProgress[0].avatar : null
}

// 언락 진행도 계산
export const calculateUnlockProgress = (
  avatar: Avatar, 
  userStats: {
    level: number
    intelligence: number
    strength: number
    health: number
    creativity: number
    social: number
    completed_quests: number
    max_streak: number
    achievements: any[]
  }
): number => {
  const condition = avatar.unlock_condition
  
  // 기본 레벨 요구사항 체크
  if (userStats.level < avatar.level_required) {
    return Math.min(100, (userStats.level / avatar.level_required) * 100)
  }
  
  // 추가 조건 체크
  switch (condition.type) {
    case 'level':
      return Math.min(100, (userStats.level / condition.value) * 100)
      
    case 'ability':
      if (condition.ability_type) {
        const currentValue = userStats[condition.ability_type as keyof typeof userStats] as number
        return Math.min(100, (currentValue / condition.value) * 100)
      }
      break
      
    case 'total_exp':
      // total_exp는 레벨에서 계산할 수 있지만, 별도로 관리하는 것이 좋음
      // 임시로 레벨 기반으로 계산
      const estimatedExp = userStats.level * 100
      return Math.min(100, (estimatedExp / condition.value) * 100)
      
    case 'achievement':
      // 업적 시스템 연동 (향후 구현)
      return 0
      
    default:
      return 100
  }
  
  return 0
}

// 아바타 정렬
export const sortAvatars = (avatars: Avatar[], sortBy: 'rarity' | 'level' | 'name' = 'rarity'): Avatar[] => {
  const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }
  
  return [...avatars].sort((a, b) => {
    switch (sortBy) {
      case 'rarity':
        return rarityOrder[a.rarity] - rarityOrder[b.rarity]
      case 'level':
        return a.level_required - b.level_required
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
}
