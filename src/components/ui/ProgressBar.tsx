import React from 'react'
import { clsx } from 'clsx'
import type { AbilityType } from '../../lib/types'

interface ProgressBarProps {
  value: number
  max: number
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gold' | 'slate'
  ability?: AbilityType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
  showPercentage?: boolean
  showValues?: boolean
  glow?: boolean
  striped?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'blue',
  ability,
  size = 'md',
  showLabel = true,
  label,
  animated = false,
  className,
  showPercentage = true,
  showValues = false,
  glow = false,
  striped = false
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  const colors = {
    blue: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600',
    red: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
    purple: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600',
    gold: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
    slate: 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
  }

  const abilityColors = {
    intelligence: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    strength: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    health: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600',
    creativity: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600',
    social: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
  }

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  }

  const glowColors = {
    blue: 'shadow-lg shadow-blue-500/25',
    green: 'shadow-lg shadow-green-500/25',
    red: 'shadow-lg shadow-red-500/25',
    yellow: 'shadow-lg shadow-yellow-500/25',
    purple: 'shadow-lg shadow-purple-500/25',
    gold: 'shadow-lg shadow-yellow-500/25',
    slate: 'shadow-lg shadow-slate-500/25',
    intelligence: 'shadow-lg shadow-blue-500/25',
    strength: 'shadow-lg shadow-red-500/25',
    health: 'shadow-lg shadow-green-500/25',
    creativity: 'shadow-lg shadow-purple-500/25',
    social: 'shadow-lg shadow-yellow-500/25'
  }

  const selectedColor = ability ? abilityColors[ability] : colors[color]
  const selectedGlow = glow ? (ability ? glowColors[ability] : glowColors[color]) : ''

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label || (ability ? `${ability.charAt(0).toUpperCase() + ability.slice(1)}` : 'Progress')}
          </span>
          <div className="flex items-center space-x-2 text-sm">
            {showValues && (
              <span className="text-slate-600 dark:text-slate-400 font-mono">
                {value.toLocaleString()} / {max.toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative',
        'shadow-inner',
        sizes[size],
        selectedGlow
      )}>
        {/* 배경 스트라이프 패턴 */}
        {striped && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}
        
        {/* 진행도 바 */}
        <div
          className={clsx(
            'h-full rounded-full relative overflow-hidden',
            'transition-all duration-1000 ease-out',
            selectedColor,
            {
              'animate-pulse': animated
            }
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* 글로우 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/20 to-transparent" />
          
          {/* 스트라이프 애니메이션 */}
          {striped && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-bounce" />
          )}
        </div>
        
        {/* 완료 시 파티클 효과 */}
        {percentage >= 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/50 via-yellow-400/50 to-yellow-300/50 animate-pulse rounded-full" />
        )}
      </div>
      
      {/* 능력치 레벨 표시 (선택적) */}
      {ability && percentage >= 100 && (
        <div className="mt-1 text-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-md">
            🎉 레벨 업!
          </span>
        </div>
      )}
    </div>
  )
}