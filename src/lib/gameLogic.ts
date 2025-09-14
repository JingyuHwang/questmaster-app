import type { AbilityType, QuestDifficulty, LevelInfo, Quest, WeeklyStats } from './types'

// 게임 상수들
export const ABILITY_TYPES: AbilityType[] = ['intelligence', 'strength', 'health', 'creativity', 'social']

export const ABILITY_ICONS: Record<AbilityType, string> = {
  intelligence: '🧠',
  strength: '💪',
  health: '❤️',
  creativity: '🎨',
  social: '🤝'
}

export const ABILITY_COLORS: Record<AbilityType, string> = {
  intelligence: 'blue',
  strength: 'red',
  health: 'green',
  creativity: 'purple',
  social: 'yellow'
}

export const ABILITY_NAMES: Record<AbilityType, string> = {
  intelligence: '지능',
  strength: '체력', 
  health: '건강',
  creativity: '창의성',
  social: '사회성'
}

export const DIFFICULTY_EXP_REWARDS: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50
}

export const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  easy: 'green',
  medium: 'yellow', 
  hard: 'red'
}

export const DIFFICULTY_NAMES: Record<QuestDifficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움'
}

/**
 * 총 경험치를 기반으로 레벨 계산
 * 공식: Level = floor(sqrt(totalExp / 100)) + 1
 */
export const calculateLevel = (totalExp: number): number => {
  return Math.floor(Math.sqrt(totalExp / 100)) + 1
}

/**
 * 특정 레벨에 필요한 총 경험치 계산
 */
export const getExpRequiredForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100
}

/**
 * 다음 레벨까지 필요한 경험치 계산
 */
export const getExpToNextLevel = (level: number): number => {
  return getExpRequiredForLevel(level + 1) - getExpRequiredForLevel(level)
}

/**
 * 현재 레벨에서의 경험치 진행도 계산
 */
export const getCurrentLevelExp = (totalExp: number, level: number): number => {
  const expRequiredForCurrentLevel = getExpRequiredForLevel(level)
  return totalExp - expRequiredForCurrentLevel
}

/**
 * 레벨 정보 종합 계산
 */
export const calculateLevelInfo = (totalExp: number): LevelInfo => {
  const currentLevel = calculateLevel(totalExp)
  const expRequiredForCurrentLevel = getExpRequiredForLevel(currentLevel)
  const expRequiredForNextLevel = getExpRequiredForLevel(currentLevel + 1)
  const currentLevelExp = totalExp - expRequiredForCurrentLevel
  const expToNextLevel = expRequiredForNextLevel - expRequiredForCurrentLevel

  return {
    currentLevel,
    currentExp: currentLevelExp,
    expToNextLevel,
    expForCurrentLevel: expRequiredForCurrentLevel,
    progress: (currentLevelExp / expToNextLevel) * 100
  }
}

/**
 * 퀘스트 완료 시 경험치 및 능력치 계산
 */
export const calculateQuestReward = (
  difficulty: QuestDifficulty,
  abilityType: AbilityType
): {
  expReward: number
  abilityBonus: number
} => {
  const baseExp = DIFFICULTY_EXP_REWARDS[difficulty]
  const abilityBonus = Math.floor(baseExp * 0.5) // 능력치는 경험치의 50%
  
  return {
    expReward: baseExp,
    abilityBonus
  }
}

/**
 * 연속 달성 보너스 계산
 */
export const calculateStreakBonus = (streakCount: number): number => {
  if (streakCount >= 30) return 2.0 // 30일 이상: 200%
  if (streakCount >= 14) return 1.5 // 2주 이상: 150%
  if (streakCount >= 7) return 1.2  // 1주 이상: 120%
  if (streakCount >= 3) return 1.1  // 3일 이상: 110%
  return 1.0 // 보너스 없음
}

/**
 * 랜덤 보너스 경험치 (5% 확률로 1.5배)
 */
export const calculateRandomBonus = (): number => {
  return Math.random() < 0.05 ? 1.5 : 1.0
}

/**
 * 레벨업 확인 및 새 레벨 반환
 */
export const checkLevelUp = (oldExp: number, newExp: number): {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  levelsGained: number
} => {
  const oldLevel = calculateLevel(oldExp)
  const newLevel = calculateLevel(newExp)
  const leveledUp = newLevel > oldLevel
  const levelsGained = newLevel - oldLevel

  return {
    leveledUp,
    oldLevel,
    newLevel,
    levelsGained
  }
}

/**
 * 능력치 등급 계산 (S, A, B, C, D)
 */
export const getAbilityRank = (abilityValue: number): string => {
  if (abilityValue >= 500) return 'S'
  if (abilityValue >= 300) return 'A'  
  if (abilityValue >= 150) return 'B'
  if (abilityValue >= 50) return 'C'
  return 'D'
}

/**
 * 전체 능력치 점수 계산
 */
export const calculateTotalAbilityScore = (abilities: Record<AbilityType, number>): number => {
  return ABILITY_TYPES.reduce((total, ability) => total + abilities[ability], 0)
}

/**
 * 퀘스트 추천 난이도 계산 (사용자 레벨 기반)
 */
export const getRecommendedDifficulty = (userLevel: number): QuestDifficulty => {
  if (userLevel >= 20) return 'hard'
  if (userLevel >= 10) return 'medium'
  return 'easy'
}

/**
 * 데일리 목표 달성률 계산
 */
export const calculateDailyGoalProgress = (
  completedQuests: number,
  targetQuests: number = 3
): {
  progress: number
  isCompleted: boolean
  remaining: number
} => {
  const progress = Math.min((completedQuests / targetQuests) * 100, 100)
  const isCompleted = completedQuests >= targetQuests
  const remaining = Math.max(targetQuests - completedQuests, 0)

  return {
    progress,
    isCompleted,
    remaining
  }
}

/**
 * 주간 통계 계산
 */
export const calculateWeeklyStats = (quests: Quest[]): WeeklyStats => {
  // 주간 퀘스트 필터링 (실제 구현 시 날짜 필터링 추가)
  const weeklyQuests = quests || []
  const completedQuests = weeklyQuests.filter(q => q.status === 'completed')
  
  const totalQuests = weeklyQuests.length
  const completedCount = completedQuests.length
  const totalExp = completedQuests.reduce((sum, q) => sum + (q.exp_reward || 0), 0)
  const completionRate = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0
  
  // 가장 많이 사용한 능력치 타입 찾기
  const abilityCounts = completedQuests.reduce((acc, quest) => {
    acc[quest.ability_type] = (acc[quest.ability_type] || 0) + 1
    return acc
  }, {} as Record<AbilityType, number>)
  
  const favoriteAbility = Object.entries(abilityCounts).reduce(
    (max, [ability, count]) => (count as number) > max.count ? { ability: ability as AbilityType, count: count as number } : max,
    { ability: 'intelligence' as AbilityType, count: 0 }
  ).ability

  return {
    totalQuests,
    completedQuests: completedCount,
    totalExp,
    completionRate,
    streak: 0, // 실제 구현 시 연속 달성 계산 로직 추가
    favoriteAbility
  }
}
