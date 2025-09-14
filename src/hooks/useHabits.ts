import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { calculateQuestReward, calculateStreakBonus } from '../lib/gameLogic'
import type { Habit, AbilityType, User } from '../lib/types'

// 한국 시간 기준 날짜 계산 유틸리티
const getKoreanDate = (date: Date = new Date()): string => {
  // UTC +9 시간 이동 (한국 시간)
  const koreanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
  return koreanTime.toISOString().split('T')[0]
}

const getKoreanYesterday = (): string => {
  const yesterday = new Date(Date.now() - 86400000) // 24시간 전
  return getKoreanDate(yesterday)
}

interface CreateHabitData {
  title: string
  ability_type: AbilityType
  frequency: 'daily' | 'weekly'
}

interface HabitWithCompletion extends Habit {
  completed_today: boolean
  can_complete: boolean
}

export const useHabits = () => {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 습관 목록 조회
  const fetchHabits = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다')
        return
      }

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (habitsError) throw habitsError

      // 오늘 완료 여부 확인
      const today = new Date().toISOString().split('T')[0]
      
      const habitsWithCompletion: HabitWithCompletion[] = (habitsData || []).map(habit => ({
        ...habit,
        completed_today: habit.last_completed_at === today,
        can_complete: habit.last_completed_at !== today
      }))

      setHabits(habitsWithCompletion)
    } catch (err) {
      console.error('습관 조회 오류:', err)
      setError(err instanceof Error ? err.message : '습관을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 습관 생성
  const createHabit = async (habitData: CreateHabitData) => {
    try {
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('로그인이 필요합니다')
      }

      const { data, error: insertError } = await supabase
        .from('habits')
        .insert([
          {
            ...habitData,
            user_id: user.id,
            streak_count: 0,
            is_active: true
          }
        ])
        .select()

      if (insertError) throw insertError

      // 목록 새로고침
      await fetchHabits()
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '습관 생성에 실패했습니다'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // 습관 완료 처리
  const completeHabit = async (habitId: string) => {
    try {
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('로그인이 필요합니다')
      }

      // 현재 습관 정보 조회
      const habit = habits.find(h => h.id === habitId)
      if (!habit) {
        throw new Error('습관을 찾을 수 없습니다')
      }

      if (!habit.can_complete) {
        throw new Error('오늘은 이미 완료했습니다')
      }

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      // 스트릭 계산
      const isConsecutive = habit.last_completed_at === yesterday
      const newStreakCount = isConsecutive ? habit.streak_count + 1 : 1

      // 경험치 계산 (습관은 easy 난이도로 취급)
      const { expReward, abilityBonus } = calculateQuestReward('easy', habit.ability_type)
      const streakBonus = calculateStreakBonus(newStreakCount)
      const finalExpReward = Math.floor(expReward * streakBonus)
      const finalAbilityBonus = Math.floor(abilityBonus * streakBonus)

      // 트랜잭션으로 습관 업데이트와 사용자 경험치 업데이트 동시 처리
      const { error: updateError } = await supabase.rpc('complete_habit', {
        habit_id: habitId,
        new_streak_count: newStreakCount,
        exp_reward: finalExpReward,
        ability_type: habit.ability_type,
        ability_bonus: finalAbilityBonus,
        completion_date: today
      })

      if (updateError) throw updateError

      // 로컬 상태 업데이트
      setHabits(prev => prev.map(h => 
        h.id === habitId 
          ? {
              ...h,
              streak_count: newStreakCount,
              last_completed_at: today,
              completed_today: true,
              can_complete: false
            }
          : h
      ))

      return { 
        success: true, 
        expGained: finalExpReward,
        abilityGained: finalAbilityBonus,
        newStreak: newStreakCount,
        bonusMultiplier: streakBonus
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '습관 완료 처리에 실패했습니다'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    }
  }

  // 습관 수정
  const updateHabit = async (habitId: string, updates: Partial<CreateHabitData>) => {
    try {
      setError(null)

      const { error: updateError } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)

      if (updateError) throw updateError

      await fetchHabits()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '습관 수정에 실패했습니다'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 습관 삭제 (비활성화)
  const deleteHabit = async (habitId: string) => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)

      if (deleteError) throw deleteError

      await fetchHabits()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '습관 삭제에 실패했습니다'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 오늘 완료할 수 있는 습관 개수
  const getTodaysHabits = () => {
    return habits.filter(habit => !habit.completed_today && habit.frequency === 'daily')
  }

  // 오늘 완료한 습관 개수
  const getCompletedTodayCount = () => {
    return habits.filter(habit => habit.completed_today && habit.frequency === 'daily').length
  }

  // 전체 일일 습관 개수
  const getDailyHabitsCount = () => {
    return habits.filter(habit => habit.frequency === 'daily').length
  }

  // 최장 스트릭 기록
  const getLongestStreak = () => {
    return habits.reduce((max, habit) => Math.max(max, habit.streak_count), 0)
  }

  // 초기 로드
  useEffect(() => {
    fetchHabits()
  }, [])

  return {
    habits,
    loading,
    error,
    createHabit,
    completeHabit,
    updateHabit,
    deleteHabit,
    fetchHabits,
    getTodaysHabits,
    getCompletedTodayCount,
    getDailyHabitsCount,
    getLongestStreak
  }
}
