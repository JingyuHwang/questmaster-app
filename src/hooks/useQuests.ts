import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Quest, CreateQuestData, UpdateQuestData } from '@/lib/types'
import { calculateQuestReward, checkLevelUp } from '@/lib/gameLogic'

interface QuestsState {
  quests: Quest[]
  loading: boolean
  error: string | null
}

interface QuestResponse {
  success: boolean
  data?: Quest | null
  message: string
  expGained?: number
  abilityGained?: number
  leveledUp?: boolean
  newLevel?: number
}

export const useQuests = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [state, setState] = useState<QuestsState>({
    quests: [],
    loading: true,
    error: null
  })

  // 퀘스트 목록 불러오기
  const fetchQuests = async (): Promise<void> => {
    if (!user) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setState(prev => ({
        ...prev,
        quests: data || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '퀘스트를 불러오는 중 오류가 발생했습니다.'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
    }
  }

  // 퀘스트 생성
  const createQuest = async (questData: CreateQuestData): Promise<QuestResponse> => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }

    try {
      // 경험치 보상 계산
      const { expReward } = calculateQuestReward(questData.difficulty, questData.ability_type)

      const insertData = {
        user_id: user.id,
        title: questData.title,
        description: questData.description || null,
        difficulty: questData.difficulty,
        ability_type: questData.ability_type,
        exp_reward: expReward,
        due_date: questData.due_date || null
      }

      const { data, error } = await supabase
        .from('quests')
        .insert(insertData)
        .select()
        .single() as any

      if (error) throw error

      // 전체 목록 새로고침 (습관과 동일하게)
      await fetchQuests()

      return { success: true, data, message: '퀘스트가 생성되었습니다!' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '퀘스트 생성 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, data: null, message: errorMessage }
    }
  }

  // 퀘스트 업데이트
  const updateQuest = async (questId: string, updateData: UpdateQuestData): Promise<QuestResponse> => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }

    try {
      const { data, error } = await supabase
        .from('quests')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', questId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // 전체 목록 새로고침
      await fetchQuests()

      return { success: true, data, message: '퀘스트가 업데이트되었습니다!' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '퀘스트 업데이트 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, data: null, message: errorMessage }
    }
  }

  // 퀘스트 완료
  const completeQuest = async (questId: string): Promise<QuestResponse> => {
    if (!user || !profile) {
      return { success: false, message: '사용자 정보를 찾을 수 없습니다.' }
    }

    try {
      // 완료할 퀘스트 찾기
      const quest = state.quests.find(q => q.id === questId)
      if (!quest) {
        return { success: false, message: '퀘스트를 찾을 수 없습니다.' }
      }

      if (quest.status === 'completed') {
        return { success: false, message: '이미 완료된 퀘스트입니다.' }
      }

      // 경험치 및 능력치 보상 계산
      const { expReward, abilityBonus } = calculateQuestReward(quest.difficulty, quest.ability_type)
      
      // 현재 사용자 통계
      const newTotalExp = profile.total_exp + expReward
      const currentAbilityValue = profile[quest.ability_type as keyof typeof profile] as number
      const newAbilityValue = currentAbilityValue + abilityBonus

      // 레벨업 확인
      const levelUpInfo = checkLevelUp(profile.total_exp, newTotalExp)

      // 퀘스트 상태 업데이트
      const { error: questError } = await supabase
        .from('quests')
        .update({
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', questId)
        .eq('user_id', user.id)

      if (questError) throw questError

      // 사용자 통계 업데이트
      const updateData: Record<string, any> = {
        total_exp: newTotalExp,
        level: levelUpInfo.newLevel,
        [quest.ability_type]: newAbilityValue,
        updated_at: new Date().toISOString()
      }

      const { error: userError } = await supabase
        .from('users')
        .update(updateData as any)
        .eq('id', user.id)

      if (userError) throw userError

      // 전체 목록 새로고침
      await fetchQuests()

      // 사용자 프로필 새로고침
      if (refreshProfile) {
        await refreshProfile()
      }

      // 업적 체크 (별도의 이벤트로 처리 - UI에서 처리)
      // checkAllAchievements() 는 대시보드나 다른 컴포넌트에서 호출

      const successMessage = levelUpInfo.leveledUp 
        ? `🎉 퀘스트 완료! ${expReward} XP 획득하고 레벨 ${levelUpInfo.newLevel}로 레벨업했습니다!`
        : `🏆 퀘스트 완료! ${expReward} XP를 획득했습니다!`

      return { 
        success: true, 
        message: successMessage,
        expGained: expReward,
        abilityGained: abilityBonus,
        leveledUp: levelUpInfo.leveledUp,
        newLevel: levelUpInfo.newLevel
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '퀘스트 완료 처리 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, message: errorMessage }
    }
  }

  // 퀘스트 삭제
  const deleteQuest = async (questId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }

    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId)
        .eq('user_id', user.id)

      if (error) throw error

      // 전체 목록 새로고침
      await fetchQuests()

      return { success: true, message: '퀘스트가 삭제되었습니다.' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '퀘스트 삭제 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, message: errorMessage }
    }
  }

  // 사용자 변경 시 퀘스트 다시 불러오기
  useEffect(() => {
    if (user) {
      fetchQuests()
      
      // 실시간 구독 설정
      const subscription = supabase
        .channel('quests-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quests',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Quest 실시간 업데이트:', payload)
            console.log('이벤트 타입:', payload.eventType)
            console.log('새 데이터:', payload.new)
            console.log('이전 데이터:', payload.old)
            
            // 모든 변경사항에 대해 목록 새로고침
            // INSERT, UPDATE, DELETE 모두 처리
            if (payload.eventType === 'INSERT') {
              console.log('새 퀘스트 생성 감지 - 목록 새로고침')
              fetchQuests()
            } else if (payload.eventType === 'UPDATE') {
              console.log('퀘스트 업데이트 감지 - 목록 새로고침')
              fetchQuests()
            } else if (payload.eventType === 'DELETE') {
              console.log('퀘스트 삭제 감지 - 목록 새로고침')
              fetchQuests()
            }
          }
        )
        .subscribe()

      // 클린업 함수
      return () => {
        subscription.unsubscribe()
      }
    } else {
      setState({
        quests: [],
        loading: false,
        error: null
      })
    }
    // fetchQuests는 user에 의존하므로 의존성 배열에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // 필터링된 퀘스트들
  const activeQuests = state.quests.filter(quest => quest.status === 'active')
  const completedQuests = state.quests.filter(quest => quest.status === 'completed')
  const failedQuests = state.quests.filter(quest => quest.status === 'failed')

  // 통계
  const questStats = {
    total: state.quests.length,
    active: activeQuests.length,
    completed: completedQuests.length,
    failed: failedQuests.length,
    completionRate: state.quests.length > 0 ? (completedQuests.length / state.quests.length) * 100 : 0
  }

  return {
    // 상태
    quests: state.quests,
    activeQuests,
    completedQuests,
    failedQuests,
    loading: state.loading,
    error: state.error,
    questStats,

    // 액션
    createQuest,
    updateQuest,
    completeQuest,
    deleteQuest,
    refreshQuests: fetchQuests
  } as const
}
