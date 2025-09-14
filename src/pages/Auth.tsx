import React, { useState } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useNavigate, useLocation } from 'react-router-dom'

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleAuthSuccess = () => {
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          {isSignUp ? (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignIn={() => setIsSignUp(false)}
            />
          ) : (
            <SignInForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setIsSignUp(true)}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2024 QuestMaster. 일상을 게임처럼, 목표를 퀘스트처럼.
          </p>
        </div>
      </div>
    </div>
  )
}