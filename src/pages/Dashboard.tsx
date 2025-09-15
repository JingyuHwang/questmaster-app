import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuests } from '@/hooks/useQuests'
import { useHabits } from '@/hooks/useHabits'
import { useAchievements } from '@/hooks/useAchievements'
import { useToast } from '@/components/ui/ToastProvider'
import { ProgressBar } from '@/components/ui/ProgressBar'
import HabitCard from '@/components/habits/HabitCard'
import { QuestCard } from '@/components/quests/QuestCard'
import { calculateLevelInfo, ABILITY_ICONS, ABILITY_COLORS } from '@/lib/gameLogic'
import type { AbilityType } from '@/lib/types'

export const Dashboard: React.FC = () => {
  // 모든 Hook을 컴포넌트 최상단에 배치
  const { profile } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const { 
    habits, 
    loading: habitsLoading, 
    completeHabit,
    getTodaysHabits,
    getCompletedTodayCount,
    getDailyHabitsCount
  } = useHabits()
  
  const {
    activeQuests,
    completedQuests,
    loading: questsLoading,
    completeQuest,
    questStats
  } = useQuests()
  
  const {
    recentAchievements,
    loading: achievementsLoading,
    checkAllAchievements
  } = useAchievements()

  // 업적 체크 (안전한 재활성화)
  useEffect(() => {
    // 모든 데이터 로딩이 완료되고 사용자 정보가 있을 때만 실행
    if (profile && !questsLoading && !habitsLoading && !achievementsLoading) {
      console.log('🎯 업적 체크 시스템 활성화')
      
      // 5초 지연 후 업적 체크 (안정성을 위해)
      const timeoutId = setTimeout(async () => {
        try {
          const newAchievements = await checkAllAchievements()
          
          if (newAchievements.length > 0) {
            console.log(`🎉 ${newAchievements.length}개의 새로운 업적 달성!`)
            
            // 업적 토스트 알림 (순차적으로 표시)
            newAchievements.forEach((achievement, index) => {
              setTimeout(() => {
                showSuccess(
                  `🏆 업적 달성!`,
                  `"${achievement.title}" 업적을 달성했습니다! +${achievement.reward_exp} XP`
                )
              }, index * 500) // 0.5초 간격으로 표시
            })
          }
        } catch (error) {
          console.error('업적 체크 중 오류:', error)
          // 에러가 발생해도 앱은 정상 작동
        }
      }, 5000) // 5초 지연
      
      return () => clearTimeout(timeoutId)
    }
  }, [profile, questsLoading, habitsLoading, achievementsLoading, checkAllAchievements, showSuccess])

  // 퀘스트 완료 핸들러 (토스트 알림 포함)
  const handleCompleteQuest = async (questId: string) => {
    const result = await completeQuest(questId)
    
    if (result.success) {
      showSuccess('퀘스트 완료!', result.message)
    } else {
      showError('오류 발생', result.message)
    }
  }

  // 습관 완료 핸들러 (토스트 알림 포함)
  const handleCompleteHabit = async (habitId: string) => {
    const result = await completeHabit(habitId)
    
    if (result.success) {
      const bonusMultiplier = result.bonusMultiplier || 1
      const bonusText = bonusMultiplier > 1 ? ` (${Math.round((bonusMultiplier - 1) * 100)}% 스트릭 보너스!)` : ''
      showSuccess(
        '습관 완료!', 
        `+${result.expGained} XP, +${result.abilityGained} 능력치 획득! 🔥${result.newStreak}일 연속${bonusText}`
      )
    } else {
      showError('오류 발생', result.error || '습관 완료 중 오류가 발생했습니다.')
    }
  }

  // Hook이 모두 호출된 후에 early return 처리
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">프로필 로딩 중...</p>
        </div>
      </div>
    )
  }

  // 모든 계산된 값들
  const levelInfo = calculateLevelInfo(profile.total_exp)
  const abilities: AbilityType[] = ['intelligence', 'strength', 'health', 'creativity', 'social']
  
  // 습관 통계
  const todayHabits = getTodaysHabits()
  const completedTodayCount = getCompletedTodayCount()
  const dailyHabitsCount = getDailyHabitsCount()
  const habitCompletionRate = dailyHabitsCount > 0 ? (completedTodayCount / dailyHabitsCount) * 100 : 0

  // 오늘 완료된 퀘스트 수 계산
  const todayCompletedQuests = completedQuests.filter(quest => {
    if (!quest.completed_at) return false
    const completedDate = new Date(quest.completed_at)
    const today = new Date()
    return completedDate.toDateString() === today.toDateString()
  })

  // 이번 주 경험치 계산 (임시로 총 경험치의 일부로 표시)
  const weeklyExp = Math.floor(profile.total_exp * 0.1) // 임시 계산

  // 연속 달성일 계산 (임시)
  const streakDays = Math.floor(Math.random() * 10) // 실제로는 별도 로직 필요

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold font-game text-slate-900 dark:text-slate-100">
          환영합니다, {profile.username}님! 🎮
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          오늘도 새로운 퀘스트에 도전해보세요
        </p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level & Experience */}
        <div className="lg:col-span-2 game-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              레벨 & 경험치
            </h2>
            <div className="level-badge">
              Level {levelInfo.currentLevel}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>총 경험치: {profile.total_exp.toLocaleString()} XP</span>
                <span>다음 레벨까지: {levelInfo.expToNextLevel - levelInfo.currentExp} XP</span>
              </div>
              <ProgressBar
                value={levelInfo.currentExp}
                max={levelInfo.expToNextLevel}
                color="gold"
                size="lg"
                animated
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="game-card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            오늘의 현황
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">완료한 퀘스트</span>
              <span className="font-semibold text-green-600">
                {todayCompletedQuests.length} / {activeQuests.length + todayCompletedQuests.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">완료한 습관</span>
              <span className="font-semibold text-blue-600">
                {completedTodayCount} / {dailyHabitsCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">연속 달성</span>
              <span className="font-semibold text-orange-600">{streakDays}일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">이번 주 경험치</span>
              <span className="font-semibold text-purple-600">{weeklyExp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ability Stats */}
      <div className="game-card p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          능력치 현황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {abilities.map((ability) => {
            const value = profile[ability]
            const maxDisplay = Math.max(100, value + 20) // 현재 값보다 20 높게 설정
            
            return (
              <div key={ability} className="ability-stat">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{ABILITY_ICONS[ability]}</span>
                    <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                      {ability === 'intelligence' ? '지능' :
                       ability === 'strength' ? '체력' :
                       ability === 'health' ? '건강' :
                       ability === 'creativity' ? '창의성' : '사회성'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {value}
                  </span>
                </div>
                <ProgressBar
                  value={value}
                  max={maxDisplay}
                  color={ABILITY_COLORS[ability] as any}
                  size="sm"
                  showLabel={false}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Quests */}
        <div className="game-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              진행 중인 퀘스트
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {activeQuests.length}개
            </span>
          </div>
          
          {questsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
              ))}
            </div>
          ) : activeQuests.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activeQuests.slice(0, 3).map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  compact={true}
                />
              ))}
              {activeQuests.length > 3 && (
                <div className="text-center pt-2">
                  <Link 
                    to="/quests" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    +{activeQuests.length - 3}개 더 보기
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                아직 진행 중인 퀘스트가 없습니다.
              </p>
              <Link to="/quests">
                <button className="game-button">
                  새 퀘스트 생성
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Daily Habits */}
        <div className="game-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              오늘의 미션
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {completedTodayCount}/{dailyHabitsCount}
              </span>
              {habitCompletionRate === 100 && dailyHabitsCount > 0 && (
                <span className="text-lg">🎉</span>
              )}
            </div>
          </div>
          
          {habitsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
              ))}
            </div>
          ) : todayHabits.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayHabits.slice(0, 4).map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  compact={true}
                />
              ))}
              {todayHabits.length > 4 && (
                <div className="text-center pt-2">
                  <Link 
                    to="/habits" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    +{todayHabits.length - 4}개 더 보기
                  </Link>
                </div>
              )}
            </div>
          ) : dailyHabitsCount > 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                오늘의 모든 미션을 완료했습니다!
              </p>
              <div className="text-2xl">🎉</div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                오늘의 일일 미션을 설정해보세요.
              </p>
              <Link to="/habits">
                <button className="game-button">
                  미션 추가
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Preview */}
      <div className="game-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            최근 업적 달성
          </h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {recentAchievements.length > 0 ? `${recentAchievements.length}개 달성` : '아직 없음'}
          </span>
        </div>
        
        {achievementsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
            ))}
          </div>
        ) : recentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      +{achievement.reward_exp} XP 보상
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentAchievements.length > 3 && (
              <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <Link 
                  to="/achievements" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  +{recentAchievements.length - 3}개 더 보기
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              첫 번째 퀘스트나 습관을 완료하고 업적을 달성해보세요!
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/quests">
                <button className="game-button game-button-sm">
                  퀘스트 시작
                </button>
              </Link>
              <Link to="/habits">
                <button className="game-button game-button-sm">
                  습관 추가
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
