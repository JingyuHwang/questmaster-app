import { useHabits } from '../hooks/useHabits'
import HabitList from '../components/habits/HabitList'
import { ABILITY_NAMES, ABILITY_ICONS } from '../lib/gameLogic'

const Habits = () => {
  const {
    habits,
    loading,
    error,
    createHabit,
    completeHabit,
    updateHabit,
    deleteHabit,
    getTodaysHabits,
    getCompletedTodayCount,
    getDailyHabitsCount,
    getLongestStreak
  } = useHabits()

  // 통계 정보
  const todayHabits = getTodaysHabits()
  const completedTodayCount = getCompletedTodayCount()
  const dailyHabitsCount = getDailyHabitsCount()
  const longestStreak = getLongestStreak()
  const completionRate = dailyHabitsCount > 0 ? (completedTodayCount / dailyHabitsCount) * 100 : 0

  // 능력치별 습관 통계
  const getAbilityStats = () => {
    const stats = habits.reduce((acc, habit) => {
      if (habit.frequency === 'daily') {
        acc[habit.ability_type] = (acc[habit.ability_type] || 0) + 1
        if (habit.completed_today) {
          acc[`${habit.ability_type}_completed`] = (acc[`${habit.ability_type}_completed`] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }

  const abilityStats = getAbilityStats()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">🎯</span>
            나의 습관
          </h1>
          <p className="text-gray-600 mt-2">
            매일 꾸준히 실천하여 성장하는 나만의 습관을 관리해보세요
          </p>
        </div>

        {/* 대시보드 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 오늘 완료율 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 완료율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(completionRate)}%
                </p>
                <p className="text-sm text-gray-500">
                  {completedTodayCount}/{dailyHabitsCount} 완료
                </p>
              </div>
              <div className="text-3xl">
                {completionRate === 100 && dailyHabitsCount > 0 ? '🎉' : 
                 completionRate >= 75 ? '😊' : 
                 completionRate >= 50 ? '😐' : '😅'}
              </div>
            </div>
            
            {/* 진행도 바 */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 최장 스트릭 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">최장 스트릭</p>
                <p className="text-2xl font-bold text-gray-900">
                  {longestStreak}일
                </p>
                <p className="text-sm text-gray-500">
                  {longestStreak >= 30 ? '전설적!' : 
                   longestStreak >= 14 ? '대단해요!' : 
                   longestStreak >= 7 ? '좋아요!' : '시작해보세요!'}
                </p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          {/* 총 습관 수 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 습관</p>
                <p className="text-2xl font-bold text-gray-900">
                  {habits.length}개
                </p>
                <p className="text-sm text-gray-500">
                  일일 {dailyHabitsCount}개 · 주간 {habits.length - dailyHabitsCount}개
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          {/* 오늘 남은 할 일 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 남은 할 일</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayHabits.length}개
                </p>
                <p className="text-sm text-gray-500">
                  {todayHabits.length === 0 ? '모두 완료!' : '화이팅!'}
                </p>
              </div>
              <div className="text-3xl">
                {todayHabits.length === 0 ? '✅' : '⏰'}
              </div>
            </div>
          </div>
        </div>

        {/* 능력치별 습관 분포 */}
        {habits.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">능력치별 습관 분포</h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(ABILITY_NAMES).map(([key, name]) => {
                const total = abilityStats[key] || 0
                const completed = abilityStats[`${key}_completed`] || 0
                const rate = total > 0 ? (completed / total) * 100 : 0
                
                return (
                  <div key={key} className="text-center">
                    <div className="text-2xl mb-2">{ABILITY_ICONS[key as keyof typeof ABILITY_ICONS]}</div>
                    <div className="font-medium text-gray-800">{name}</div>
                    <div className="text-sm text-gray-500 mb-2">{completed}/{total}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 습관 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <HabitList
            habits={habits}
            loading={loading}
            onComplete={completeHabit}
            onCreate={createHabit}
            onUpdate={updateHabit}
            onDelete={deleteHabit}
            showCreateButton={true}
          />
        </div>
      </div>
    </div>
  )
}

export default Habits
