import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  variant?: 'default' | 'game' | 'achievement' | 'levelup'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  variant = 'game'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  }

  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    game: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-slate-300/50 dark:border-slate-600/50 shadow-2xl',
    achievement: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300/50 dark:border-yellow-600/50 shadow-2xl shadow-yellow-500/25',
    levelup: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300/50 dark:border-blue-600/50 shadow-2xl shadow-blue-500/25'
  }

  const backdropVariants = {
    default: 'bg-black/50',
    game: 'bg-slate-900/60 backdrop-blur-sm',
    achievement: 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm',
    levelup: 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm'
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 transition-all duration-300',
          backdropVariants[variant]
        )}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className={clsx(
        'relative w-full rounded-xl shadow-2xl transition-all duration-300 ease-out',
        'transform scale-100 opacity-100',
        sizes[size],
        variants[variant],
        className
      )}>
        {/* Decorative Elements for Game Modal */}
        {variant === 'game' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75" />
          </>
        )}

        {/* Achievement Modal Decorations */}
        {variant === 'achievement' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-xl pointer-events-none" />
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="text-3xl animate-bounce">🏆</div>
            </div>
          </>
        )}

        {/* Level Up Modal Decorations */}
        {variant === 'levelup' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-xl pointer-events-none" />
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="text-3xl animate-pulse">⭐</div>
            </div>
          </>
        )}
        
        {/* Header */}
        {title && (
          <div className={clsx(
            'flex items-center justify-between p-6 border-b',
            variant === 'game' ? 'border-slate-200/50 dark:border-slate-700/50' : 'border-slate-200 dark:border-slate-700'
          )}>
            <h3 className={clsx(
              'font-bold text-slate-900 dark:text-slate-100',
              size === 'xs' || size === 'sm' ? 'text-lg' : 'text-xl',
              variant === 'achievement' && 'text-yellow-800 dark:text-yellow-200',
              variant === 'levelup' && 'text-blue-800 dark:text-blue-200'
            )}>
              {title}
            </h3>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={clsx(
                  'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                  'rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                game={false}
              >
                <X size={20} />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={clsx(
          'p-6',
          !title && 'pt-8' // 추가 패딩 if no header
        )}>
          {children}
        </div>

        {/* Footer decoration for special modals */}
        {(variant === 'achievement' || variant === 'levelup') && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping delay-75"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-ping delay-150"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}