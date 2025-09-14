import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute, AuthRedirect } from './components/auth/ProtectedRoute'
import { ToastProvider } from './components/ui/ToastProvider'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { PageLoadingSpinner } from './components/ui/LoadingSpinner'
import { Auth } from './pages/Auth'
import { useAuth } from './hooks/useAuth'
import './styles/theme.css'

// 코드 스플리팅을 위한 lazy loading
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Quests = React.lazy(() => import('./pages/Quests').then(module => ({ default: module.Quests })))
const Habits = React.lazy(() => import('./pages/Habits'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Achievements = React.lazy(() => import('./pages/Achievements'))

function App() {
  const { loading: authLoading, isAuthenticated, error } = useAuth()
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    // 앱 초기화 타이머 - 무한 로딩 방지
    const initTimer = setTimeout(() => {
      if (!appReady) {
        console.warn('App initialization timeout - forcing ready state')
        setAppReady(true)
      }
    }, 5000) // 5초 후 강제 로딩 완료

    if (!authLoading) {
      setAppReady(true)
      clearTimeout(initTimer)
    }

    return () => clearTimeout(initTimer)
  }, [authLoading, appReady])

  // 앱 로딩 중일 때
  if (!appReady) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <PageLoadingSpinner label="QuestMaster를 시작하는 중..." />
        </div>
      </ThemeProvider>
    )
  }

  // 인증 오류가 있을 때
  if (error) {
    console.error('Auth error:', error)
    // 오류가 있어도 앱은 계속 실행 (비인증 상태로)
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes - redirect authenticated users */}
            <Route 
              path="/auth" 
              element={
                <AuthRedirect>
                  <Auth />
                </AuthRedirect>
              } 
            />
            
            {/* Protected Routes with Suspense */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoadingSpinner label="대시보드를 로딩중입니다..." />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/quests" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoadingSpinner label="퀘스트를 로딩중입니다..." />}>
                      <Quests />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/habits" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoadingSpinner label="습관을 로딩중입니다..." />}>
                      <Habits />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/achievements" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoadingSpinner label="업적을 로딩중입니다..." />}>
                      <Achievements />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoadingSpinner label="프로필을 로딩중입니다..." />}>
                      <Profile />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Root redirect */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
