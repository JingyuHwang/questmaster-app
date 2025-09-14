import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle, 
  warning: AlertTriangle,
  info: AlertCircle
}

const styleMap = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
}

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400', 
  info: 'text-blue-600 dark:text-blue-400'
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  const Icon = iconMap[type]

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose, duration])

  return (
    <div className={clsx(
      'rounded-lg border p-4 shadow-sm transition-all duration-300',
      styleMap[type]
    )}>
      <div className="flex items-start space-x-3">
        <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', iconColorMap[type])} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{title}</h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// 인라인 에러 메시지
interface ErrorMessageProps {
  message: string
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return (
    <div className={clsx('flex items-center space-x-2 text-red-600 dark:text-red-400', className)}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

// 성공 메시지
interface SuccessMessageProps {
  message: string
  className?: string
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, className }) => {
  return (
    <div className={clsx('flex items-center space-x-2 text-green-600 dark:text-green-400', className)}>
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}
