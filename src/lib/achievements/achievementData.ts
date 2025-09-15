// 업적 관련 상수 데이터
import type { AvatarRarity, Achievement } from '../types'

export type AchievementCategory = 'quest' | 'habit' | 'level' | 'ability' | 'streak' | 'special'

export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, string> = {
  quest: '퀘스트',
  habit: '습관',
  level: '레벨',
  ability: '능력치',
  streak: '연속',
  special: '특별'
}

export const ACHIEVEMENT_CATEGORY_COLORS: Record<AchievementCategory, string> = {
  quest: 'blue',
  habit: 'green',
  level: 'yellow',
  ability: 'purple',
  streak: 'orange',
  special: 'pink'
}

export const ACHIEVEMENT_RARITY_NAMES: Record<AvatarRarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
  mythic: '신화'
}

// 기본 업적 데이터
export const getDefaultAchievements = (): Achievement[] => [
  // 퀘스트 관련 업적
  {
    id: 'first_quest',
    title: '첫 걸음',
    description: '첫 번째 퀘스트를 완료하세요',
    icon: '🎯',
    category: 'quest' as AchievementCategory,
    condition_type: 'quest_count' as const,
    condition_value: 1,
    reward_exp: 50,
    rarity: 'common' as AvatarRarity,
    unlock_message: '퀘스트 마스터로의 여정이 시작되었습니다!',
    hidden: false
  },
  {
    id: 'quest_master',
    title: '퀘스트 마스터',
    description: '퀘스트 50개를 완료하세요',
    icon: '🏆',
    category: 'quest' as AchievementCategory,
    condition_type: 'quest_count' as const,
    condition_value: 50,
    reward_exp: 500,
    rarity: 'epic' as AvatarRarity,
    unlock_message: '당신은 진정한 퀘스트 마스터입니다!',
    hidden: false
  },
  
  // 습관 관련 업적
  {
    id: 'habit_starter',
    title: '습관의 시작',
    description: '첫 번째 습관을 완료하세요',
    icon: '✅',
    category: 'habit' as AchievementCategory,
    condition_type: 'habit_complete' as const,
    condition_value: 1,
    reward_exp: 30,
    rarity: 'common' as AvatarRarity,
    unlock_message: '좋은 습관의 시작입니다!',
    hidden: false
  },
  {
    id: 'streak_week',
    title: '일주일 챌린지',
    description: '7일 연속 습관을 완료하세요',
    icon: '🔥',
    category: 'streak' as AchievementCategory,
    condition_type: 'max_streak' as const,
    condition_value: 7,
    reward_exp: 200,
    rarity: 'rare' as AvatarRarity,
    unlock_message: '꾸준함의 힘을 보여주셨네요!',
    hidden: false
  },
  {
    id: 'streak_month',
    title: '한 달의 기적',
    description: '30일 연속 습관을 완료하세요',
    icon: '🌟',
    category: 'streak' as AchievementCategory,
    condition_type: 'max_streak' as const,
    condition_value: 30,
    reward_exp: 1000,
    rarity: 'legendary' as AvatarRarity,
    unlock_message: '30일 연속! 당신은 진정한 습관의 마스터입니다!',
    hidden: false
  },

  // 레벨 관련 업적
  {
    id: 'level_5',
    title: '성장하는 모험가',
    description: '레벨 5에 도달하세요',
    icon: '📈',
    category: 'level' as AchievementCategory,
    condition_type: 'level' as const,
    condition_value: 5,
    reward_exp: 100,
    rarity: 'common' as AvatarRarity,
    unlock_message: '레벨업! 계속해서 성장하고 있네요!',
    hidden: false
  },
  {
    id: 'level_20',
    title: '베테랑 퀘스터',
    description: '레벨 20에 도달하세요',
    icon: '⭐',
    category: 'level' as AchievementCategory,
    condition_type: 'level' as const,
    condition_value: 20,
    reward_exp: 500,
    rarity: 'epic' as AvatarRarity,
    unlock_message: '베테랑의 경지에 도달했습니다!',
    hidden: false
  },

  // 능력치 관련 업적
  {
    id: 'intelligence_50',
    title: '지혜로운 현자',
    description: '지능을 50까지 올리세요',
    icon: '🧠',
    category: 'ability' as AchievementCategory,
    condition_type: 'ability' as const,
    condition_value: 50,
    ability_type: 'intelligence' as const,
    reward_exp: 300,
    rarity: 'rare' as AvatarRarity,
    unlock_message: '지혜의 힘이 증가했습니다!',
    hidden: false
  },
  {
    id: 'strength_50',
    title: '강인한 전사',
    description: '체력을 50까지 올리세요',
    icon: '💪',
    category: 'ability' as AchievementCategory,
    condition_type: 'ability' as const,
    condition_value: 50,
    ability_type: 'strength' as const,
    reward_exp: 300,
    rarity: 'rare' as AvatarRarity,
    unlock_message: '강인한 체력을 얻었습니다!',
    hidden: false
  },

  // 특별 업적
  {
    id: 'night_owl',
    title: '올빼미',
    description: '밤 12시 이후에 퀘스트를 완료하세요',
    icon: '🦉',
    category: 'special' as AchievementCategory,
    condition_type: 'special' as const,
    condition_value: 1,
    reward_exp: 150,
    rarity: 'rare' as AvatarRarity,
    unlock_message: '밤늦게까지 수고하셨네요!',
    hidden: true
  },
  {
    id: 'early_bird',
    title: '얼리버드',
    description: '오전 6시 이전에 퀘스트를 완료하세요',
    icon: '🐦',
    category: 'special' as AchievementCategory,
    condition_type: 'special' as const,
    condition_value: 1,
    reward_exp: 150,
    rarity: 'rare' as AvatarRarity,
    unlock_message: '일찍 일어나는 새가 벌레를 잡는다!',
    hidden: true
  },
  {
    id: 'perfectionist',
    title: '완벽주의자',
    description: '하루에 모든 습관을 완료하세요',
    icon: '💎',
    category: 'special' as AchievementCategory,
    condition_type: 'special' as const,
    condition_value: 1,
    reward_exp: 200,
    rarity: 'epic' as AvatarRarity,
    unlock_message: '완벽한 하루를 보내셨군요!',
    hidden: true
  }
]
