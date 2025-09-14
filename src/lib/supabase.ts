import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key를 환경변수에서 찾을 수 없습니다.')
}

// Supabase 클라이언트 생성 (타입 제약 없이)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('사용자 세션 가져오기 오류:', error)
      return null
    }

    return session?.user || null
  } catch (error) {
    console.error('사용자 세션 가져오기 오류:', error)
    return null
  }
}

// 사용자 프로필 정보 가져오기
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('사용자 프로필 가져오기 오류:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('사용자 프로필 가져오기 오류:', error)
    return null
  }
}

// 회원가입 시 사용자 프로필 생성
export const createUserProfile = async (userId: string, email: string, username?: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        username: username || email.split('@')[0],
        level: 1,
        total_exp: 0,
        intelligence: 0,
        strength: 0,
        health: 0,
        creativity: 0,
        social: 0
      })
      .select()
      .single()

    if (error) {
      console.error('사용자 프로필 생성 오류:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('사용자 프로필 생성 오류:', error)
    throw error
  }
}

// 사용자 통계 업데이트
export const updateUserStats = async (
  userId: string, 
  expGain: number, 
  abilityType: 'intelligence' | 'strength' | 'health' | 'creativity' | 'social'
) => {
  try {
    // 현재 사용자 정보 가져오기
    const currentUser = await getUserProfile(userId)
    if (!currentUser) throw new Error('사용자를 찾을 수 없습니다')

    const newTotalExp = currentUser.total_exp + expGain
    const currentAbilityValue = currentUser[abilityType]
    const newAbilityExp = currentAbilityValue + expGain
    
    // 레벨 계산 (간단한 공식: 레벨 = sqrt(총경험치/100))
    const newLevel = Math.floor(Math.sqrt(newTotalExp / 100)) + 1

    const updateData = {
      total_exp: newTotalExp,
      level: newLevel,
      [abilityType]: newAbilityExp,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('사용자 통계 업데이트 오류:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('사용자 통계 업데이트 오류:', error)
    throw error
  }
}

// 사용자 인증 이벤트 리스너 설정
export const setupAuthListener = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user || null)
  })
}
