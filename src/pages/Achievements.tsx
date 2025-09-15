import React, { useState, useEffect } from 'react'
import { AchievementCard } from '../components/achievements/AchievementCard'
import { LoadingSpinner, PageLoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/ToastProvider'
import { getDefaultAchievements, ACHIEVEMENT_CATEGORY_NAMES, ACHIEVEMENT_CATEGORY_COLORS } from '../lib/achievements/achievementData'
import type { Achievement, UserAchievement, AchievementCategory } from '../lib/types'
import { Trophy, Star, Target, Calendar, Zap, Gift, Filter } from 'lucide-react'
import { Button } from '../components/ui/Button'
import clsx from 'clsx'

const Achievements: React.FC = () => {
  const { profile, loading: authLoading } = useAuth()
  const { showSuccess } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [showCompleted, setShowCompleted] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // 기본 업적 데이터 로드
        const defaultAchievements = getDefaultAchievements()
        setAchievements(defaultAchievements)

        // 사용자 업적 진행도 시뮬레이션 (실제로는 Supabase에서 로드)
        if (profile) {
          const mockUserAchievements: UserAchievement[] = [
            {
              user_id: profile.id,
              achievement_id: 'first_quest',
              progress: 100,
              is_completed: true,
              unlocked_at: new Date().toISOString()
            },
            {
              user_id: profile.id,
              achievement_id: 'habit_starter',
              progress: 100,
              is_completed: true,
              unlocked_at: new Date().toISOString()
            },
            {
              user_id: profile.id,
              achievement_id: 'streak_week',
              progress: 60,
              is_completed: false
            },
            {
              user_id: profile.id,
              achievement_id: 'level_5',
              progress: Math.min(100, (profile.level / 5) * 100),
              is_completed: profile.level >= 5,
              unlocked_at: profile.level >= 5 ? new Date().toISOString() : undefined
            }
          ]
          setUserAchievements(mockUserAchievements)
        }
      } catch (error) {
        console.error('업적 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && profile) {
      loadAchievements()
    }
  }, [profile, authLoading])

  const handleAchievementClick = (achievement: Achievement) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
    
    if (userAchievement?.is_completed) {
      showSuccess('업적 달성!', `"${achievement.title}" 업적을 이미 달성하셨습니다.`)
    }
  }

  const getFilteredAchievements = () => {
    let filtered = achievements

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === selectedCategory)
    }

    // 완료 상태 필터
    if (!showCompleted) {
      const completedIds = userAchievements
        .filter(ua => ua.is_completed)
        .map(ua => ua.achievement_id)
      filtered = filtered.filter(achievement => !completedIds.includes(achievement.id))
    }

    return filtered
  }

  const getCompletionStats = () => {
    const total = achievements.length
    const completed = userAchievements.filter(ua => ua.is_completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, percentage }
  }

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; completed: number }> = {}
    
    achievements.forEach(achievement => {
      const category = achievement.category
      if (!stats[category]) {
        stats[category] = { total: 0, completed: 0 }
      }
      stats[category].total++
      
      const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
      if (userAchievement?.is_completed) {
        stats[category].completed++
      }
    })

    return stats
  }

  const categories: { key: AchievementCategory | 'all'; icon: React.ReactNode; label: string }[] = [
    { key: 'all', icon: <Trophy size={16} />, label: '전체' },
    { key: 'quest', icon: <Target size={16} />, label: '퀘스트' },
    { key: 'habit', icon: <Calendar size={16} />, label: '습관' },
    { key: 'level', icon: <Star size={16} />, label: '레벨' },
    { key: 'ability', icon: <Zap size={16} />, label: '능력치' },
    { key: 'streak', icon: <Filter size={16} />, label: '연속' },
    { key: 'special', icon: <Gift size={16} />, label: '특별' }
  ]

  if (authLoading || loading) {
    return <PageLoadingSpinner label="업적을 로딩중입니다..." />
  }

  const { total, completed, percentage } = getCompletionStats()
  const categoryStats = getCategoryStats()
  const filteredAchievements = getFilteredAchievements()

  return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            🏆 업적
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            퀘스트와 습관을 통해 업적을 달성하고 특별한 보상을 받아보세요!
          </p>
        </div>

        {/* 전체 진행도 */}
        <div className="game-card p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              전체 진행도
            </h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completed} / {total} 달성
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 카테고리별 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(1).map(category => {
            const stats = categoryStats[category.key] || { total: 0, completed: 0 }
            const categoryPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            const color = ACHIEVEMENT_CATEGORY_COLORS[category.key as AchievementCategory]

            return (
              <div 
                key={category.key}
                className={clsx(
                  'game-card p-4 text-center cursor-pointer transition-all duration-200',
                  `hover:bg-${color}-50 dark:hover:bg-${color}-900/20`,
                  selectedCategory === category.key ? `ring-2 ring-${color}-400` : ''
                )}
                onClick={() => setSelectedCategory(category.key as AchievementCategory)}
              >
                <div className={clsx('text-2xl mb-2', `text-${color}-600 dark:text-${color}-400`)}>
                  {category.icon}
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {category.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stats.completed}/{stats.total} ({categoryPercentage}%)
                </div>
              </div>
            )
          })}
        </div>

        {/* 필터 옵션 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                {category.icon}
                <span>{category.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>완료된 업적 표시</span>
            </label>
          </div>
        </div>

        {/* 업적 그리드 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedCategory === 'all' ? '모든 업적' : ACHIEVEMENT_CATEGORY_NAMES[selectedCategory as AchievementCategory]}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAchievements.length}개 업적
            </div>
          </div>

          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                표시할 업적이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                다른 카테고리를 선택하거나 필터를 조정해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAchievements.map(achievement => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)

                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievement}
                    onClick={handleAchievementClick}
                    size="md"
                    showProgress={true}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* 진행 팁 */}
        <div className="game-card p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            💡 업적 달성 팁
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong>꾸준함이 핵심:</strong> 매일 조금씩이라도 퀘스트와 습관을 실행하세요.
            </div>
            <div>
              <strong>다양한 도전:</strong> 여러 카테고리의 업적을 골고루 도전해보세요.
            </div>
            <div>
              <strong>숨겨진 업적:</strong> 특별한 조건을 만족하면 숨겨진 업적이 나타납니다.
            </div>
            <div>
              <strong>보상 활용:</strong> 업적 달성으로 얻은 경험치로 더 빠르게 성장하세요.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements