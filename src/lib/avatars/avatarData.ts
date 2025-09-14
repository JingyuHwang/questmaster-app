// 아바타 관련 상수 데이터
import type { AvatarRarity } from '../types'

export const AVATAR_RARITY_NAMES: Record<AvatarRarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
  mythic: '신화'
}

export const AVATAR_RARITY_COLORS: Record<AvatarRarity, string> = {
  common: 'gray',
  rare: 'blue',
  epic: 'purple', 
  legendary: 'yellow',
  mythic: 'orange'
}

export const AVATAR_UNLOCK_TYPES = {
  level: '레벨 달성',
  ability: '능력치 달성',
  total_exp: '총 경험치 달성',
  achievement: '업적 달성'
} as const

// 기본 아바타 데이터
export const AVATARS = [
  {
    id: 'starter',
    name: '초보 모험가',
    rarity: 'common' as const,
    level_required: 1,
    ability_type: null,
    image_url: '',
    unlock_condition: {
      type: 'level' as const,
      value: 1,
      description: '기본 아바타'
    },
    unlock_message: '모험을 시작하세요! 초보 모험가가 되었습니다.'
  },
  {
    id: 'scholar',
    name: '현명한 학자',
    rarity: 'rare' as const,
    level_required: 5,
    ability_type: 'intelligence' as const,
    image_url: '',
    unlock_condition: {
      type: 'ability' as const,
      ability_type: 'intelligence' as const,
      value: 50,
      description: '지능 50 달성'
    },
    unlock_message: '지혜의 빛이 당신을 비춥니다! 현명한 학자가 되었습니다.'
  },
  {
    id: 'warrior',
    name: '강인한 전사',
    rarity: 'rare' as const,
    level_required: 5,
    ability_type: 'strength' as const,
    image_url: '',
    unlock_condition: {
      type: 'ability' as const,
      ability_type: 'strength' as const,
      value: 50,
      description: '체력 50 달성'
    },
    unlock_message: '강철 같은 의지로 무장했습니다! 강인한 전사가 되었습니다.'
  },
  {
    id: 'healer',
    name: '치유사',
    rarity: 'epic' as const,
    level_required: 10,
    ability_type: 'health' as const,
    image_url: '',
    unlock_condition: {
      type: 'ability' as const,
      ability_type: 'health' as const,
      value: 100,
      description: '건강 100 달성'
    },
    unlock_message: '생명의 힘이 당신과 함께합니다! 치유사가 되었습니다.'
  },
  {
    id: 'artist',
    name: '창조적 예술가',
    rarity: 'epic' as const,
    level_required: 10,
    ability_type: 'creativity' as const,
    image_url: '',
    unlock_condition: {
      type: 'ability' as const,
      ability_type: 'creativity' as const,
      value: 100,
      description: '창의성 100 달성'
    },
    unlock_message: '무한한 상상력이 펼쳐집니다! 창조적 예술가가 되었습니다.'
  },
  {
    id: 'legend',
    name: '전설의 마스터',
    rarity: 'legendary' as const,
    level_required: 20,
    ability_type: null,
    image_url: '',
    unlock_condition: {
      type: 'total_exp' as const,
      value: 10000,
      description: '총 경험치 10,000 달성'
    },
    unlock_message: '전설이 되었습니다! 모든 도전을 극복한 진정한 마스터입니다.'
  }
]

// 아바타 관련 헬퍼 함수들
export const getAvatarById = (id: string) => {
  return AVATARS.find(avatar => avatar.id === id)
}

export const checkUnlockCondition = (avatar: any, user: any): boolean => {
  if (user.level < avatar.level_required) return false
  
  const condition = avatar.unlock_condition
  switch (condition.type) {
    case 'level':
      return user.level >= condition.value
    case 'ability':
      if (condition.ability_type) {
        return user[condition.ability_type] >= condition.value
      }
      return false
    case 'total_exp':
      return user.total_exp >= condition.value
    default:
      return false
  }
}

export const getDefaultAvatarForLevel = (level: number) => {
  if (level >= 20) return getAvatarById('legend')
  if (level >= 10) return getAvatarById('healer')
  if (level >= 5) return getAvatarById('scholar')
  return getAvatarById('starter')
}
