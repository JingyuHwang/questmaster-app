// 게임 관련 상수 타입
export const ABILITY_TYPES = ['intelligence', 'strength', 'health', 'creativity', 'social'] as const
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export const QUEST_STATUS = ['active', 'completed', 'failed'] as const

export type AbilityType = typeof ABILITY_TYPES[number]
export type QuestDifficulty = typeof DIFFICULTY_LEVELS[number]
export type QuestStatus = typeof QUEST_STATUS[number]

// 아바타 관련 타입
export type AvatarRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Avatar {
  id: string
  name: string
  rarity: AvatarRarity
  level_required: number
  unlock_condition: {
    type: 'level' | 'ability' | 'total_exp' | 'achievement'
    value: number
    ability_type?: AbilityType
    description: string
  }
  ability_type?: AbilityType | null
  image_url: string
  description?: string
  unlock_message: string
  is_default?: boolean
}

export interface UserAvatar {
  user_id: string
  avatar_id: string
  unlocked_at: string
  is_equipped: boolean
}

// 사용자 관련 타입
export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  current_avatar_id?: string  // 현재 장착한 아바타
  level: number
  total_exp: number
  intelligence: number
  strength: number
  health: number
  creativity: number
  social: number
  created_at: string
  updated_at: string
}

// 퀘스트 관련 타입
export interface Quest {
  id: string
  user_id: string
  title: string
  description?: string
  difficulty: QuestDifficulty
  status: QuestStatus
  ability_type: AbilityType
  exp_reward: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// 습관 관련 타입
export interface Habit {
  id: string
  user_id: string
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
  streak_count: number
  last_completed_at?: string
  is_active: boolean
  created_at: string
}

// 업적 관련 타입
export type AchievementCategory = 'quest' | 'habit' | 'level' | 'ability' | 'streak' | 'special'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  condition_type: 'quest_count' | 'habit_complete' | 'level' | 'ability' | 'max_streak' | 'special'
  condition_value: number
  ability_type?: AbilityType
  reward_exp: number
  rarity: AvatarRarity
  unlock_message: string
  hidden: boolean
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  progress: number
  is_completed: boolean
  unlocked_at?: string
}

// 게임 로직 관련 타입
export interface LevelInfo {
  currentLevel: number
  currentExp: number
  expToNextLevel: number
  expForCurrentLevel: number
  progress: number // 0-100 퍼센트
}

export interface AbilityStats {
  intelligence: number
  strength: number
  health: number
  creativity: number
  social: number
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// 퀘스트 생성/수정 폼 데이터
export interface CreateQuestData {
  title: string
  description?: string
  difficulty: QuestDifficulty
  ability_type: AbilityType
  due_date?: string
}

export interface UpdateQuestData extends Partial<CreateQuestData> {
  status?: QuestStatus
}

// 습관 생성/수정 폼 데이터
export interface CreateHabitData {
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
}

export interface UpdateHabitData extends Partial<CreateHabitData> {
  is_active?: boolean
}

// 통계 관련 타입
export interface DashboardStats {
  totalQuests: number
  completedQuests: number
  activeQuests: number
  completionRate: number
  totalExp: number
  currentLevel: number
  weeklyProgress: {
    day: string
    completed: number
    total: number
  }[]
  abilityBreakdown: AbilityStats
}

// 주간 통계 타입
export interface WeeklyStats {
  totalQuests: number
  completedQuests: number
  totalExp: number
  completionRate: number
  streak: number
  favoriteAbility: AbilityType
}

// 아바타 컬렉션 통계 타입
export interface AvatarCollectionStats {
  total: number
  unlocked: number
  percentage: number
  totalUnlocked: number
  totalAvatars: number
  completionPercentage: number
  statsByRarity: Record<AvatarRarity, { total: number; unlocked: number }>
  unlockedAvatars: Avatar[]
}

// Supabase Database 타입 정의
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<User, 'id' | 'created_at'>> & {
          updated_at?: string
        }
      }
      quests: {
        Row: Quest
        Insert: Omit<Quest, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Quest, 'id' | 'created_at'>> & {
          updated_at?: string
        }
      }
      habits: {
        Row: Habit
        Insert: Omit<Habit, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Habit, 'id' | 'created_at'>>
      }
      user_avatars: {
        Row: UserAvatar
        Insert: UserAvatar
        Update: Partial<UserAvatar>
      }
      achievements: {
        Row: Achievement
        Insert: Omit<Achievement, 'id'> & { id?: string }
        Update: Partial<Achievement>
      }
      user_achievements: {
        Row: UserAchievement
        Insert: UserAchievement
        Update: Partial<UserAchievement>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 폼 밸리데이션 관련
export interface FormErrors {
  [key: string]: string | undefined
}

// UI 컴포넌트 Props 타입
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  ability?: AbilityType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  glow?: boolean
  game?: boolean
}

export interface ProgressBarProps {
  value: number
  max: number
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gold' | 'slate'
  ability?: AbilityType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
  showPercentage?: boolean
  showValues?: boolean
  glow?: boolean
  striped?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  variant?: 'default' | 'game' | 'achievement' | 'levelup'
}

// 알림 시스템 타입
export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'levelup'
  title: string
  message: string
  duration?: number
  avatar?: Avatar
  achievement?: Achievement
}

// 게임 이벤트 타입
export interface GameEvent {
  type: 'quest_complete' | 'habit_complete' | 'level_up' | 'avatar_unlock' | 'achievement_unlock'
  data: any
  timestamp: string
}

// 사용자 진행 상황 타입
export interface UserProgress {
  level: number
  total_exp: number
  abilities: AbilityStats
  completed_quests: number
  max_streak: number
  achievements: UserAchievement[]
  avatars: UserAvatar[]
  current_avatar?: Avatar
}

// 아바타 언락 진행도 타입
export interface AvatarUnlockProgress {
  avatar: Avatar
  progress: number
  isUnlocked: boolean
  progressText: string
  nextMilestone?: string
}