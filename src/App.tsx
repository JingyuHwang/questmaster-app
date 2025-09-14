import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute, AuthRedirect } from './components/auth/ProtectedRoute'
import { ToastProvider } from './components/ui/ToastProvider'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { PageLoadingSpinner } from './components/ui/LoadingSpinner'
import { Auth } from './pages/Auth'
import './styles/theme.css'

// 코드 스플리팅을 위한 lazy loading
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Quests = React.lazy(() => import('./pages/Quests').then(module => ({ default: module.Quests })))
const Habits = React.lazy(() => import('./pages/Habits'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Achievements = React.lazy(() => import('./pages/Achievements'))

function App() {
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
              <Suspense fallback={<PageLoadingSpinner label="업적을 로딩중입니다..." />}>
                <Achievements />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner label="프로필을 로딩중입니다..." />}>
                <Profile />
              </Suspense>
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
