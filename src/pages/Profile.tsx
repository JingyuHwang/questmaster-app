import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AvatarCard } from '../components/avatar/AvatarCard'
import { LoadingSpinner, PageLoadingSpinner } from '../components/ui/LoadingSpinner'
import { useToast } from '../components/ui/ToastProvider'
import { AVATARS } from '../lib/avatars/avatarData'
import type { Avatar } from '../lib/types'
import { User, Crown, Trophy, Star, Settings, Edit } from 'lucide-react'
import { Button } from '../components/ui/Button'

const Profile: React.FC = () => {
  const { profile, loading: authLoading } = useAuth()
  const { showSuccess, showError } = useToast()
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 아바타 데이터 로드
    const loadAvatars = async () => {
      try {
        setAvatars(AVATARS)
        setSelectedAvatar(profile?.current_avatar_id || 'starter')
      } catch (error) {
        console.error('아바타 로드 오류:', error)
        showError('오류', '아바타 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && profile) {
      loadAvatars()
    }
  }, [profile, authLoading, showError])

  const handleAvatarEquip = async (avatar: Avatar) => {
    try {
      // TODO: Supabase에 아바타 변경 저장
      setSelectedAvatar(avatar.id)
      showSuccess('아바타 변경!', `${avatar.name}으로 아바타가 변경되었습니다.`)
    } catch (error) {
      showError('변경 실패', '아바타 변경에 실패했습니다.')
    }
  }

  const isAvatarUnlocked = (avatar: Avatar): boolean => {
    if (!profile) return false
    
    // 기본 아바타는 항상 언락
    if (avatar.id === 'starter') return true
    
    // 레벨 조건 체크
    if (profile.level < avatar.level_required) return false
    
    // 추가 조건 체크
    const condition = avatar.unlock_condition
    switch (condition.type) {
      case 'level':
        return profile.level >= condition.value
      case 'ability':
        if (condition.ability_type) {
          const abilityValue = profile[condition.ability_type as keyof typeof profile] as number
          return abilityValue >= condition.value
        }
        return false
      case 'total_exp':
        return profile.total_exp >= condition.value
      default:
        return false
    }
  }

  const getUnlockedCount = (): number => {
    return avatars.filter(avatar => isAvatarUnlocked(avatar)).length
  }

  const getAchievementLevel = (): string => {
    const unlockedCount = getUnlockedCount()
    const totalCount = avatars.length
    const percentage = (unlockedCount / totalCount) * 100
    
    if (percentage >= 100) return '전설의 컬렉터'
    if (percentage >= 80) return '숙련된 컬렉터'
    if (percentage >= 60) return '열성적인 컬렉터'
    if (percentage >= 40) return '아바타 애호가'
    if (percentage >= 20) return '초보 컬렉터'
    return '탐험가'
  }

  if (authLoading || loading) {
    return <PageLoadingSpinner label="프로필을 로딩중입니다..." />
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          프로필을 찾을 수 없습니다
        </h1>
      </div>
    )
  }

  return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 프로필 헤더 */}
        <div className="game-card p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* 현재 아바타 */}
            <div className="flex-shrink-0">
              {selectedAvatar && avatars.find(a => a.id === selectedAvatar) && (
                <AvatarCard
                  avatar={avatars.find(a => a.id === selectedAvatar)!}
                  isUnlocked={true}
                  isEquipped={true}
                  size="lg"
                  clickable={false}
                  showProgress={false}
                />
              )}
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {profile.username || '익명의 퀘스터'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Crown size={16} className="text-yellow-500" />
                      <span>Level {profile.level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-blue-500" />
                      <span>{profile.total_exp.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy size={16} className="text-purple-500" />
                      <span>{getAchievementLevel()}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Edit size={16} />
                  <span>편집</span>
                </Button>
              </div>

              {/* 능력치 현황 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {profile.intelligence}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">지능</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {profile.strength}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">체력</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {profile.health}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">건강</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {profile.creativity}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">창의성</div>
                </div>
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {profile.social}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">사회성</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 아바타 컬렉션 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                아바타 컬렉션
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getUnlockedCount()} / {avatars.length} 언락됨 ({Math.round((getUnlockedCount() / avatars.length) * 100)}%)
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">컬렉션 등급</div>
              <div className="font-bold text-purple-600 dark:text-purple-400">
                {getAchievementLevel()}
              </div>
            </div>
          </div>

          {/* 아바타 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {avatars.map((avatar) => {
              const isUnlocked = isAvatarUnlocked(avatar)
              const isEquipped = selectedAvatar === avatar.id

              return (
                <AvatarCard
                  key={avatar.id}
                  avatar={avatar}
                  isUnlocked={isUnlocked}
                  isEquipped={isEquipped}
                  userStats={profile}
                  onEquip={handleAvatarEquip}
                  size="md"
                  showProgress={true}
                />
              )
            })}
          </div>

          {/* 언락 팁 */}
          <div className="game-card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              💡 아바타 언락 팁
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong>레벨업:</strong> 퀘스트와 습관을 완료하여 경험치를 쌓으세요.
              </div>
              <div>
                <strong>능력치 향상:</strong> 특정 능력치에 집중하여 전문 아바타를 언락하세요.
              </div>
              <div>
                <strong>꾸준한 활동:</strong> 매일 습관을 완료하고 스트릭을 유지하세요.
              </div>
              <div>
                <strong>다양한 퀘스트:</strong> 여러 난이도의 퀘스트에 도전해보세요.
              </div>
            </div>
          </div>
        </div>

        {/* 통계 및 업적 미리보기 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 활동 통계 */}
          <div className="game-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              활동 통계
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">가입일</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">현재 레벨</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Level {profile.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">총 경험치</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {profile.total_exp.toLocaleString()} XP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">언락된 아바타</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getUnlockedCount()} / {avatars.length}
                </span>
              </div>
            </div>
          </div>

          {/* 다음 목표 */}
          <div className="game-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              다음 목표
            </h3>
            <div className="space-y-4">
              {avatars
                .filter(avatar => !isAvatarUnlocked(avatar))
                .slice(0, 3)
                .map(avatar => (
                  <div key={avatar.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                      🔒
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {avatar.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {avatar.unlock_condition.description}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile