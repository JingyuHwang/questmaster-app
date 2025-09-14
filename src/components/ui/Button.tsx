import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import type { AbilityType } from '../../lib/types'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'default'
  ability?: AbilityType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
  glow?: boolean
  game?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  ability,
  size = 'md',
  loading = false,
  disabled,
  children,
  glow = false,
  game = true,
  ...props
}, ref) => {
  const baseStyles = clsx(
    'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    'relative overflow-hidden',
    {
      // 게임 스타일 활성화
      'transform hover:scale-105 active:scale-95': game,
      'hover:shadow-xl': game,
      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent': game,
      'before:transform before:-skew-x-12 before:-translate-x-full before:transition-transform before:duration-700': game,
      'hover:before:translate-x-full': game,
    }
  )
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-blue-500/25',
    default: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white focus:ring-slate-500 shadow-lg hover:shadow-slate-500/25',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white focus:ring-blue-500 bg-white/50 hover:shadow-lg hover:shadow-blue-500/25',
    ghost: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500 hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-red-500/25',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-green-500/25',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white focus:ring-yellow-500 shadow-lg hover:shadow-yellow-500/25'
  }
  
  const abilityVariants = {
    intelligence: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-blue-500/25',
    strength: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-red-500/25',
    health: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-green-500/25',
    creativity: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white focus:ring-purple-500 shadow-lg hover:shadow-purple-500/25',
    social: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white focus:ring-yellow-500 shadow-lg hover:shadow-yellow-500/25'
  }
  
  const sizes = {
    xs: 'px-2 py-1 text-xs rounded-md font-game',
    sm: 'px-3 py-1.5 text-sm rounded-lg font-game',
    md: 'px-4 py-2 text-sm rounded-lg font-semibold',
    lg: 'px-6 py-3 text-base rounded-lg font-semibold',
    xl: 'px-8 py-4 text-lg rounded-xl font-bold'
  }

  const glowEffects = {
    primary: 'shadow-2xl shadow-blue-500/50',
    default: 'shadow-2xl shadow-blue-500/50',
    secondary: 'shadow-2xl shadow-slate-500/50',
    outline: 'shadow-2xl shadow-blue-500/50',
    ghost: 'shadow-lg shadow-blue-500/25',
    danger: 'shadow-2xl shadow-red-500/50',
    success: 'shadow-2xl shadow-green-500/50',
    warning: 'shadow-2xl shadow-yellow-500/50',
    intelligence: 'shadow-2xl shadow-blue-500/50',
    strength: 'shadow-2xl shadow-red-500/50',
    health: 'shadow-2xl shadow-green-500/50',
    creativity: 'shadow-2xl shadow-purple-500/50',
    social: 'shadow-2xl shadow-yellow-500/50'
  }

  const selectedVariant = ability ? abilityVariants[ability] : variants[variant]
  const selectedGlow = glow ? (ability ? glowEffects[ability] : glowEffects[variant]) : ''

  return (
    <button
      className={clsx(
        baseStyles,
        selectedVariant,
        sizes[size],
        selectedGlow,
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>로딩중...</span>
        </div>
      )}
      {!loading && children}
    </button>
  )
})

Button.displayName = 'Button'