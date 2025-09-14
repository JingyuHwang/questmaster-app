import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth'
}) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // 로딩 중일 때는 간단한 로딩 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}

// 이미 로그인한 사용자를 인증 페이지에서 리다이렉트하는 컴포넌트
interface AuthRedirectProps {
  children: React.ReactNode
  redirectTo?: string
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // 로딩 중일 때는 로딩 스피너 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">QuestMaster 로딩 중...</p>
        </div>
      </div>
    )
  }

  // 이미 로그인한 경우 대시보드나 이전 페이지로 리다이렉트
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || redirectTo
    return <Navigate to={from} replace />
  }

  // 로그인하지 않은 경우 인증 페이지 표시
  return <>{children}</>
}
