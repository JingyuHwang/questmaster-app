import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Achievement, UserAchievement } from '@/lib/types'

// 기본 업적 데이터
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    title: '첫 걸음',
    description: '첫 번째 퀘스트를 완료하세요',
    icon: '🏃',
    category: 'quest',
    condition_type: 'quest_count',
    condition_value: 1,
    reward_exp: 50,
    rarity: 'common',
    unlock_message: '모험의 첫 걸음을 내딛었습니다!',
    hidden: false
  },
  {
    id: 'quest_master',
    title: '퀘스트 마스터',
    description: '10개의 퀘스트를 완료하세요',
    icon: '⚔️',
    category: 'quest',
    condition_type: 'quest_count',
    condition_value: 10,
    reward_exp: 200,
    rarity: 'rare',
    unlock_message: '진정한 퀘스트 마스터가 되었습니다!',
    hidden: false
  },
  {
    id: 'habit_starter',
    title: '습관의 시작',
    description: '첫 번째 습관을 완료하세요',
    icon: '✅',
    category: 'habit',
    condition_type: 'habit_complete',
    condition_value: 1,
    reward_exp: 30,
    rarity: 'common',
    unlock_message: '좋은 습관의 시작입니다!',
    hidden: false
  },
  {
    id: 'level_up',
    title: '성장의 증거',
    description: '레벨 5에 도달하세요',
    icon: '⬆️',
    category: 'level',
    condition_type: 'level',
    condition_value: 5,
    reward_exp: 100,
    rarity: 'rare',
    unlock_message: '꾸준한 노력의 결과입니다!',
    hidden: false
  },
  {
    id: 'streak_week',
    title: '일주일 연속',
    description: '7일 연속 활동하세요',
    icon: '🔥',
    category: 'streak',
    condition_type: 'max_streak',
    condition_value: 7,
    reward_exp: 150,
    rarity: 'epic',
    unlock_message: '놀라운 지속력을 보여주었습니다!',
    hidden: false
  }
]

interface AchievementProgress {
  achievement: Achievement
  progress: number
  isCompleted: boolean
  progressText: string
}

export const useAchievements = () => {
  const { user, profile } = useAuth()
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [questStats, setQuestStats] = useState({ completed: 0, total: 0 })
  const [habitStats, setHabitStats] = useState({ completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAchievements, setIsCheckingAchievements] = useState(false) // 업적 체크 중 방지

  // 사용자 업적 및 통계 로드
  const fetchUserAchievements = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // 사용자 업적 로드
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      if (achievementError) throw achievementError
      setUserAchievements(achievementData || [])
      
      // 퀘스트 통계 로드
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('status')
        .eq('user_id', user.id)
        
      if (questError) throw questError
      
      const completedQuests = questData?.filter(q => q.status === 'completed').length || 0
      const totalQuests = questData?.length || 0
      setQuestStats({ completed: completedQuests, total: totalQuests })
      
      // 습관 통계 로드 (완료된 습관 체크인 수)
      const { data: habitData, error: habitError } = await supabase
        .from('habits')
        .select('streak_count')
        .eq('user_id', user.id)
        .eq('is_active', true)
        
      if (habitError) throw habitError
      
      const totalHabitCompletes = habitData?.reduce((sum, h) => sum + h.streak_count, 0) || 0
      const totalHabits = habitData?.length || 0
      setHabitStats({ completed: totalHabitCompletes, total: totalHabits })
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 업적 진행도 계산
  const calculateProgress = (achievement: Achievement): number => {
    if (!profile) return 0

    switch (achievement.condition_type) {
      case 'quest_count':
        return Math.min(100, (questStats.completed / achievement.condition_value) * 100)
        
      case 'habit_complete':
        return Math.min(100, (habitStats.completed / achievement.condition_value) * 100)
        
      case 'level':
        return Math.min(100, (profile.level / achievement.condition_value) * 100)
        
      case 'ability':
        if (achievement.ability_type) {
          const abilityValue = profile[achievement.ability_type as keyof typeof profile] as number
          return Math.min(100, (abilityValue / achievement.condition_value) * 100)
        }
        return 0
        
      case 'max_streak':
        // 최대 스트릭 계산 (현재 모든 습관의 최대 스트릭)
        const maxStreak = Math.max(...(habitStats.total > 0 ? [profile.level] : [0])) // 임시로 레벨 사용
        return Math.min(100, (maxStreak / achievement.condition_value) * 100)
        
      default:
        return 0
    }
  }

  // 업적 언락 체크 (RPC 함수 사용) - 완전 비활성화
  const checkAchievementUnlock = async (achievement: Achievement): Promise<boolean> => {
    console.log(`업적 체크 비활성화됨: ${achievement.id}`)
    return false // 임시로 모든 업적 체크 비활성화
  }

  // 모든 업적 체크 (순차 실행으로 중복 방지)
  const checkAllAchievements = async (): Promise<Achievement[]> => {
    // 이미 체크 중이면 뺈 배열 반환
    if (isCheckingAchievements) {
      console.log('업적 체크가 이미 진행 중 - 스킨')
      return []
    }

    setIsCheckingAchievements(true)
    const newlyUnlocked: Achievement[] = []
    
    try {
      console.log('업적 전체 체크 시작')
      
      // 동시 실행 방지를 위해 순차적으로 처리
      for (const achievement of ACHIEVEMENTS) {
        try {
          const unlocked = await checkAchievementUnlock(achievement)
          if (unlocked) {
            newlyUnlocked.push(achievement)
            console.log(`새 업적 언락: ${achievement.title}`)
          }
        } catch (error) {
          console.error(`업적 ${achievement.id} 체크 중 오류:`, error)
          // 개별 업적 오류는 무시하고 계속 진행
          continue
        }
      }
      
      console.log(`업적 체크 완료: ${newlyUnlocked.length}개 새로 언락`)
      return newlyUnlocked
    } finally {
      setIsCheckingAchievements(false)
    }
  }

  // 업적 진행도 정보
  const getAchievementProgress = (): AchievementProgress[] => {
    return ACHIEVEMENTS.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
      const progress = userAchievement?.progress || calculateProgress(achievement)
      const isCompleted = userAchievement?.is_completed || false
      
      let progressText = ''
      if (isCompleted) {
        progressText = '완료됨'
      } else {
        switch (achievement.condition_type) {
          case 'quest_count':
            progressText = `${questStats.completed}/${achievement.condition_value} 퀘스트`
            break
          case 'habit_complete':
            progressText = `${habitStats.completed}/${achievement.condition_value} 습관`
            break
          case 'level':
            progressText = `레벨 ${profile?.level || 0}/${achievement.condition_value}`
            break
          case 'max_streak':
            const currentStreak = Math.floor((progress / 100) * achievement.condition_value)
            progressText = `${currentStreak}/${achievement.condition_value}일 연속`
            break
          default:
            progressText = `${Math.floor(progress)}%`
        }
      }
      
      return {
        achievement,
        progress: Math.min(100, progress),
        isCompleted,
        progressText
      }
    })
  }

  // 최근 달성한 업적들
  const getRecentAchievements = (limit: number = 5): Achievement[] => {
    const recentUserAchievements = userAchievements
      .filter(ua => ua.is_completed && ua.unlocked_at)
      .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
      .slice(0, limit)
    
    return recentUserAchievements
      .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievement_id))
      .filter((a): a is Achievement => a !== undefined)
  }

  // 완료된 업적 수
  const getCompletedCount = (): number => {
    return userAchievements.filter(ua => ua.is_completed).length
  }

  // 완료율
  const getCompletionRate = (): number => {
    return ACHIEVEMENTS.length > 0 ? (getCompletedCount() / ACHIEVEMENTS.length) * 100 : 0
  }

  useEffect(() => {
    if (user) {
      fetchUserAchievements()
    } else {
      setUserAchievements([])
      setQuestStats({ completed: 0, total: 0 })
      setHabitStats({ completed: 0, total: 0 })
      setLoading(false)
      setError(null)
    }
  }, [user])

  return {
    // 상태
    achievements: ACHIEVEMENTS,
    userAchievements,
    loading,
    error,
    
    // 계산된 값
    achievementProgress: getAchievementProgress(),
    recentAchievements: getRecentAchievements(),
    completedCount: getCompletedCount(),
    completionRate: getCompletionRate(),
    
    // 액션
    checkAllAchievements,
    checkAchievementUnlock,
    refetch: fetchUserAchievements
  }
}
