import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, getCurrentUser, getUserProfile, createUserProfile } from '@/lib/supabase'
import type { User } from '@/lib/types'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  error: string | null
}

interface AuthResponse {
  success: boolean
  message: string
  needsEmailConfirmation?: boolean
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let mounted = true

    // 초기 세션 확인
    const checkSession = async (): Promise<void> => {
      try {
        const user = await getCurrentUser()
        
        if (user && mounted) {
          const profile = await getUserProfile(user.id)
          setState({
            user,
            profile,
            loading: false,
            error: null
          })
        } else if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : '인증 확인 중 오류가 발생했습니다.'
          })
        }
      }
    }

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return

        if (session?.user) {
          try {
            let profile = await getUserProfile(session.user.id)
            
            // 프로필이 없으면 생성
            if (!profile) {
              profile = await createUserProfile(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata?.username
              )
            }
            
            setState({
              user: session.user,
              profile,
              loading: false,
              error: null
            })
          } catch (error) {
            setState({
              user: session.user,
              profile: null,
              loading: false,
              error: error instanceof Error ? error.message : '프로필 로드 실패'
            })
          }
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      }
    )

    checkSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 회원가입
  const signUp = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      })

      if (error) throw error

      // 이메일 인증이 필요한 경우
      if (data.user && !data.session) {
        setState(prev => ({ ...prev, loading: false }))
        return {
          success: true,
          message: '이메일을 확인하여 계정을 활성화해주세요.',
          needsEmailConfirmation: true
        }
      }

      setState(prev => ({ ...prev, loading: false }))
      return { success: true, message: '회원가입이 완료되었습니다!' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, message: errorMessage }
    }
  }

  // 로그인
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      setState(prev => ({ ...prev, loading: false }))
      return { success: true, message: '로그인 성공!' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, message: errorMessage }
    }
  }

  // 로그아웃
  const signOut = async (): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setState(prev => ({ ...prev, loading: false }))
      return { success: true, message: '로그아웃되었습니다.' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, message: errorMessage }
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { success: true, message: '비밀번호 재설정 링크를 이메일로 발송했습니다.' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '비밀번호 재설정 요청 중 오류가 발생했습니다.'
      return { success: false, message: errorMessage }
    }
  }

  // 프로필 새로고침
  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return

    try {
      const profile = await getUserProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))
    } catch (error) {
      console.error('프로필 새로고침 오류:', error)
    }
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile
  } as const
}
