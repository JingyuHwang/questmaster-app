import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Avatar, UserAvatar, AvatarCollectionStats } from '../lib/types'
import { 
  AVATARS, 
  getAvatarById, 
  checkUnlockCondition,
  getDefaultAvatarForLevel
} from '../lib/avatars/avatarData'
import { 
  calculateCollectionStats,
  getEquippedAvatar,
  getRecommendedAvatar
} from '../lib/avatars/avatarUtils'

export const useAvatars = () => {
  const { user, profile } = useAuth()
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 사용자 아바타 데이터 로드
  const fetchUserAvatars = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserAvatars(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // 아바타 언락
  const unlockAvatar = useCallback(async (avatarId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const avatar = getAvatarById(avatarId)
      if (!avatar) {
        return { success: false, error: 'Avatar not found' }
      }

      // 이미 언락된 아바타인지 확인
      const existingAvatar = userAvatars.find(ua => ua.avatar_id === avatarId)
      if (existingAvatar) {
        return { success: false, error: 'Avatar already unlocked' }
      }

      // 언락 조건 확인
      const userStats = {
        level: profile?.level || 1,
        intelligence: profile?.intelligence || 0,
        strength: profile?.strength || 0,
        health: profile?.health || 0,
        creativity: profile?.creativity || 0,
        social: profile?.social || 0,
        completed_quests: 0, // TODO: 실제 완료된 퀘스트 수 가져오기
        max_streak: 0, // TODO: 실제 최대 스트릭 가져오기
        achievements: [] // TODO: 실제 업적 가져오기
      }

      if (!checkUnlockCondition(avatar, userStats)) {
        return { success: false, error: 'Unlock conditions not met' }
      }

      // 첫 번째 아바타인 경우 자동으로 장착
      const isFirstAvatar = userAvatars.length === 0

      const { error: insertError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
          unlocked_at: new Date().toISOString(),
          is_equipped: isFirstAvatar
        })

      if (insertError) throw insertError

      // 첫 번째 아바타인 경우 프로필에도 업데이트
      if (isFirstAvatar) {
        await supabase
          .from('users')
          .update({ current_avatar_id: avatarId })
          .eq('id', user.id)
      }

      // 상태 업데이트
      const newUserAvatar: UserAvatar = {
        user_id: user.id,
        avatar_id: avatarId,
        unlocked_at: new Date().toISOString(),
        is_equipped: isFirstAvatar
      }

      setUserAvatars(prev => [...prev, newUserAvatar])

      return { 
        success: true, 
        avatar,
        message: avatar.unlock_message || `${avatar.name} 아바타를 획득했습니다!`
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }, [user, profile, userAvatars])

  // 아바타 장착
  const equipAvatar = useCallback(async (avatarId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      // 해당 아바타가 언락되어 있는지 확인
      const unlockedAvatar = userAvatars.find(ua => ua.avatar_id === avatarId)
      if (!unlockedAvatar) {
        return { success: false, error: 'Avatar not unlocked' }
      }

      // 트랜잭션으로 처리
      const { error: updateError } = await supabase.rpc('equip_avatar', {
        p_user_id: user.id,
        p_avatar_id: avatarId
      })

      if (updateError) throw updateError

      // 로컬 상태 업데이트
      setUserAvatars(prev => 
        prev.map(ua => ({
          ...ua,
          is_equipped: ua.avatar_id === avatarId
        }))
      )

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }, [user, userAvatars])

  // 자동 아바타 언락 체크 (레벨업 시 호출)
  const checkAutoUnlock = useCallback(async () => {
    if (!user || !profile) return

    const userStats = {
      level: profile.level,
      intelligence: profile.intelligence,
      strength: profile.strength,
      health: profile.health,
      creativity: profile.creativity,
      social: profile.social,
      completed_quests: 0, // TODO: 실제 값
      max_streak: 0, // TODO: 실제 값
      achievements: [] // TODO: 실제 값
    }

    const unlockedIds = new Set(userAvatars.map(ua => ua.avatar_id))
    const newUnlocks: Avatar[] = []

    // 모든 아바타 체크
    for (const avatar of AVATARS) {
      if (!unlockedIds.has(avatar.id) && checkUnlockCondition(avatar, userStats)) {
        const result = await unlockAvatar(avatar.id)
        if (result.success && result.avatar) {
          newUnlocks.push(result.avatar)
        }
      }
    }

    return newUnlocks
  }, [user, profile, userAvatars, unlockAvatar])

  // 컬렉션 통계 계산
  const collectionStats: AvatarCollectionStats = calculateCollectionStats(userAvatars, AVATARS)

  // 현재 장착한 아바타
  const equippedAvatar = getEquippedAvatar(userAvatars, AVATARS)

  // 추천 아바타 (다음 목표)
  const recommendedAvatar = profile ? getRecommendedAvatar(
    {
      level: profile.level,
      intelligence: profile.intelligence,
      strength: profile.strength,
      health: profile.health,
      creativity: profile.creativity,
      social: profile.social,
      completed_quests: 0,
      max_streak: 0,
      achievements: []
    },
    userAvatars,
    AVATARS
  ) : null

  // 언락된 아바타 목록
  const unlockedAvatars = AVATARS.filter(avatar => 
    userAvatars.some(ua => ua.avatar_id === avatar.id)
  )

  // 잠긴 아바타 목록
  const lockedAvatars = AVATARS.filter(avatar => 
    !userAvatars.some(ua => ua.avatar_id === avatar.id)
  )

  // 초기 로드
  useEffect(() => {
    fetchUserAvatars()
  }, [fetchUserAvatars])

  // 기본 아바타 자동 언락 (신규 사용자)
  useEffect(() => {
    const initializeDefaultAvatar = async () => {
      if (!user || !profile || userAvatars.length > 0 || loading) return

      const defaultAvatarId = 'starter'
      await unlockAvatar(defaultAvatarId)
    }

    initializeDefaultAvatar()
  }, [user, profile, userAvatars, loading, unlockAvatar])

  return {
    // 상태
    userAvatars,
    loading,
    error,
    
    // 계산된 값
    collectionStats,
    equippedAvatar,
    recommendedAvatar,
    unlockedAvatars,
    lockedAvatars,
    
    // 액션
    unlockAvatar,
    equipAvatar,
    checkAutoUnlock,
    refetch: fetchUserAvatars,
    
    // 헬퍼
    isUnlocked: (avatarId: string) => userAvatars.some(ua => ua.avatar_id === avatarId),
    isEquipped: (avatarId: string) => userAvatars.some(ua => ua.avatar_id === avatarId && ua.is_equipped)
  }
}