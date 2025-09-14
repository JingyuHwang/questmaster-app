import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './Button'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: Sun, label: '라이트' },
    { value: 'dark' as const, icon: Moon, label: '다크' },
    { value: 'system' as const, icon: Monitor, label: '시스템' }
  ]

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          onClick={() => setTheme(value)}
          variant={theme === value ? 'default' : 'ghost'}
          size="sm"
          className={`
            relative p-2 min-w-0
            ${theme === value 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
          title={`${label} 테마로 변경`}
        >
          <Icon size={16} />
          <span className="sr-only">{label} 테마</span>
        </Button>
      ))}
    </div>
  )
}

// 간단한 토글 버전
export const SimpleThemeToggle: React.FC = () => {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="p-2"
      title={`${actualTheme === 'dark' ? '라이트' : '다크'} 모드로 변경`}
    >
      {actualTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      <span className="sr-only">테마 변경</span>
    </Button>
  )
}
