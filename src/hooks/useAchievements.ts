import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { getDefaultAchievements } from '@/lib/achievements/achievementData'
import type { Achievement, UserAchievement } from '@/lib/types'

export const useAchievements = () => {
  const { user, profile } = useAuth()
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [questStats, setQuestStats] = useState({ completed: 0, total: 0 })
  const [habitStats, setHabitStats] = useState({ completed: 0, total: 0, maxStreak: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 중복 실행 방지를 위한 ref들
  const isCheckingRef = useRef(false)
  const lastCheckTimeRef = useRef<number>(0)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const achievements = getDefaultAchievements()

  // 사용자 업적 및 통계 로드
  const fetchUserAchievements = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      // 사용자 업적 로드
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      if (achievementError) {
        console.warn('User achievements fetch error:', achievementError)
        setUserAchievements([])
      } else {
        setUserAchievements(achievementData || [])
      }
      
      // 퀘스트 통계 로드
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('status')
        .eq('user_id', user.id)
        
      if (questError) {
        console.warn('Quest stats fetch error:', questError)
        setQuestStats({ completed: 0, total: 0 })
      } else {
        const completedQuests = questData?.filter(q => q.status === 'completed').length || 0
        const totalQuests = questData?.length || 0
        setQuestStats({ completed: completedQuests, total: totalQuests })
      }
      
      // 습관 통계 로드
      const { data: habitData, error: habitError } = await supabase
        .from('habits')
        .select('streak_count')
        .eq('user_id', user.id)
        .eq('is_active', true)
        
      if (habitError) {
        console.warn('Habit stats fetch error:', habitError)
        setHabitStats({ completed: 0, total: 0, maxStreak: 0 })
      } else {
        const totalHabitCompletes = habitData?.reduce((sum, h) => sum + h.streak_count, 0) || 0
        const totalHabits = habitData?.length || 0
        const maxStreak = Math.max(...(habitData?.map(h => h.streak_count) || [0]), 0)
        setHabitStats({ completed: totalHabitCompletes, total: totalHabits, maxStreak })
      }
      
    } catch (err: any) {
      console.error('Achievement fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 업적 진행도 계산
  const calculateProgress = useCallback((achievement: Achievement): number => {
    if (!profile) return 0

    try {
      switch (achievement.condition_type) {
        case 'quest_count':
          return Math.min(100, Math.floor((questStats.completed / achievement.condition_value) * 100))
          
        case 'habit_complete':
          return Math.min(100, Math.floor((habitStats.completed / achievement.condition_value) * 100))
          
        case 'level':
          return Math.min(100, Math.floor((profile.level / achievement.condition_value) * 100))
          
        case 'ability':
          if (achievement.ability_type) {
            const abilityValue = profile[achievement.ability_type as keyof typeof profile] as number
            return Math.min(100, Math.floor((abilityValue / achievement.condition_value) * 100))
          }
          return 0
          
        case 'max_streak':
          return Math.min(100, Math.floor((habitStats.maxStreak / achievement.condition_value) * 100))
          
        default:
          return 0
      }
    } catch (error) {
      console.warn(`Progress calculation error for ${achievement.id}:`, error)
      return 0
    }
  }, [profile, questStats, habitStats])

  // 모든 업적 체크 (안전한 버전)
  const checkAllAchievements = async (): Promise<Achievement[]> => {
    // 중복 실행 방지
    if (isCheckingRef.current) {
      console.log('Achievement check already in progress - skipping')
      return []
    }

    // 너무 빈번한 체크 방지 (10초 쿨다운)
    const now = Date.now()
    if (now - lastCheckTimeRef.current < 10000) {
      console.log('Achievement check too frequent - skipping')
      return []
    }

    if (!user || !profile) {
      console.log('No user or profile - skipping achievement check')
      return []
    }

    isCheckingRef.current = true
    lastCheckTimeRef.current = now
    const newlyUnlocked: Achievement[] = []
    
    try {
      console.log('🔍 Starting safe achievement check...')
      
      // 시뮬레이션: 실제 조건을 체크하여 새로 언락될 업적 찾기
      for (const achievement of achievements) {
        const progress = calculateProgress(achievement)
        const existingAchievement = userAchievements.find(ua => 
          ua.achievement_id === achievement.id && ua.is_completed
        )
        
        // 이미 완료된 업적은 스킵
        if (existingAchievement) continue
        
        // 100% 진행도 달성하고 아직 언락되지 않은 업적
        if (progress >= 100) {
          console.log(`🏆 Achievement ready to unlock: ${achievement.title} (${progress}%)`)
          
          try {
            // 데이터베이스에 업적 달성 저장
            const { data, error } = await supabase.rpc('unlock_achievement', {
              p_user_id: user.id,
              p_achievement_id: achievement.id,
              p_progress: 100
            })
            
            if (error) {
              // 409 에러나 중복 에러는 무시
              if (error.message?.includes('duplicate') || error.message?.includes('already')) {
                console.log(`Achievement ${achievement.id} already exists - ignored`)
                continue
              }
              throw error
            }
            
            if (data?.success) {
              newlyUnlocked.push(achievement)
              console.log(`✨ Achievement unlocked and saved: ${achievement.title}`)
            }
          } catch (saveError: any) {
            console.error(`Failed to save achievement ${achievement.id}:`, saveError)
            // 저장 실패해도 알림은 표시 (사용자 경험 우선)
            newlyUnlocked.push(achievement)
          }
        }
      }
      
      console.log(`✅ Achievement check complete: ${newlyUnlocked.length} newly unlocked`)
      
      // 새로 달성한 업적이 있으면 데이터 새로고침
      if (newlyUnlocked.length > 0) {
        setTimeout(() => {
          fetchUserAchievements()
        }, 1000) // 1초 후 새로고침
      }
      
      return newlyUnlocked
      
    } catch (error: any) {
      console.error('Achievement check failed:', error)
      return []
    } finally {
      isCheckingRef.current = false
    }
  }

  // 업적 진행도 정보
  const getAchievementProgress = useCallback(() => {
    return achievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
      const calculatedProgress = calculateProgress(achievement)
      const progress = userAchievement?.progress || calculatedProgress
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
            progressText = `${habitStats.maxStreak}/${achievement.condition_value}일 연속`
            break
          case 'ability':
            if (achievement.ability_type && profile) {
              const currentValue = profile[achievement.ability_type as keyof typeof profile] as number
              progressText = `${currentValue}/${achievement.condition_value}`
            } else {
              progressText = `${Math.floor(progress)}%`
            }
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
  }, [achievements, userAchievements, calculateProgress, questStats, habitStats, profile])

  // 최근 달성한 업적들
  const getRecentAchievements = useCallback((limit: number = 5): Achievement[] => {
    const recentUserAchievements = userAchievements
      .filter(ua => ua.is_completed && ua.unlocked_at)
      .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
      .slice(0, limit)
    
    return recentUserAchievements
      .map(ua => achievements.find(a => a.id === ua.achievement_id))
      .filter((a): a is Achievement => a !== undefined)
  }, [userAchievements, achievements])

  // 완료된 업적 수
  const getCompletedCount = useCallback((): number => {
    return userAchievements.filter(ua => ua.is_completed).length
  }, [userAchievements])

  // 완료율
  const getCompletionRate = useCallback((): number => {
    return achievements.length > 0 ? (getCompletedCount() / achievements.length) * 100 : 0
  }, [achievements.length, getCompletedCount])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
      isCheckingRef.current = false
    }
  }, [])

  // 사용자 변경 시 데이터 로드
  useEffect(() => {
    if (user) {
      fetchUserAchievements()
    } else {
      setUserAchievements([])
      setQuestStats({ completed: 0, total: 0 })
      setHabitStats({ completed: 0, total: 0, maxStreak: 0 })
      setLoading(false)
      setError(null)
    }
  }, [user])

  return {
    // 상태
    achievements,
    userAchievements,
    loading,
    error,
    
    // 계산된 값
    achievementProgress: getAchievementProgress(),
    recentAchievements: getRecentAchievements(),
    completedCount: getCompletedCount(),
    completionRate: getCompletionRate(),
    
    // 통계
    questStats,
    habitStats,
    
    // 액션
    checkAllAchievements,
    refetch: fetchUserAchievements
  }
}
