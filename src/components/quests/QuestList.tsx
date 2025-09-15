import React, { useState, useEffect } from 'react'
import { Plus, Filter, Search, Target, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuestCard } from './QuestCard'
import { CreateQuestModal } from './CreateQuestModal'
import { useQuests } from '@/hooks/useQuests'
import type { Quest, QuestStatus } from '@/lib/types'

interface QuestListProps {
  className?: string
}

// 간단한 알림 컴포넌트
const Notification: React.FC<{
  message: string
  type: 'success' | 'error'
  onClose: () => void
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000) // 5초 후 자동 닫기
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {type === 'success' && <CheckCircle size={20} />}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export const QuestList: React.FC<QuestListProps> = ({ className }) => {
  const { 
    quests, 
    loading, 
    error, 
    completeQuest, 
    deleteQuest,
    questStats,
    refreshQuests
  } = useQuests()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<QuestStatus | 'all'>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  // 필터링된 퀘스트 목록
  const getFilteredQuests = (): Quest[] => {
    let filtered = quests

    // 상태별 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quest => quest.status === statusFilter)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredQuests = getFilteredQuests()

  const handleCompleteQuest = async (questId: string) => {
    const result = await completeQuest(questId)
    
    if (result.success) {
      // 성공 메시지 표시
      setNotification({
        message: result.message || '퀘스트를 완료했습니다!',
        type: 'success'
      })
    } else {
      // 오류 메시지 표시
      setNotification({
        message: result.message || '퀘스트 완료 중 오류가 발생했습니다.',
        type: 'error'
      })
    }
  }

  const handleDeleteQuest = async (questId: string) => {
    const result = await deleteQuest(questId)
    
    if (result.success) {
      setNotification({
        message: '퀘스트가 삭제되었습니다.',
        type: 'success'
      })
    } else {
      setNotification({
        message: '퀘스트 삭제 중 오류가 발생했습니다.',
        type: 'error'
      })
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">⚠️ 오류가 발생했습니다</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 알림 표시 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="mr-2" size={24} />
            퀘스트 관리
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            현재 {questStats.active}개의 활성 퀘스트가 있습니다
          </p>
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>새 퀘스트</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {questStats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">총 퀘스트</div>
        </div>
        
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {questStats.active}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">진행 중</div>
        </div>
        
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {questStats.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">완료</div>
        </div>
        
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(questStats.completionRate)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">완료율</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="퀘스트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QuestStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="active">진행 중</option>
            <option value="completed">완료</option>
            <option value="failed">실패</option>
          </select>
        </div>
      </div>

      {/* Quest List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">퀘스트를 불러오는 중...</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm || statusFilter !== 'all' ? (
            // 필터링된 결과가 없을 때
            <>
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                다른 검색어나 필터를 시도해보세요
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                필터 초기화
              </Button>
            </>
          ) : (
            // 퀘스트가 아예 없을 때
            <>
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                아직 퀘스트가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                첫 번째 퀘스트를 만들어 모험을 시작하세요!
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                첫 퀘스트 만들기
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleCompleteQuest}
              onDelete={handleDeleteQuest}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Create Quest Modal */}
      <CreateQuestModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onQuestCreated={() => {
          // 퀘스트 생성 후 목록 새로고침
          refreshQuests()
        }}
      />
    </div>
  )
}
