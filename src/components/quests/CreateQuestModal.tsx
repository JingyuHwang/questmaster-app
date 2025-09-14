import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { QuestForm } from './QuestForm'
import { useQuests } from '@/hooks/useQuests'
import type { CreateQuestData } from '@/lib/types'

interface CreateQuestModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createQuest, loading, refreshQuests } = useQuests()

  const handleSubmit = async (data: CreateQuestData) => {
    const result = await createQuest(data)
    
    if (result.success) {
      // createQuest 내부에서 fetchQuests()를 이미 호출하므로 중복 호출 제거
      onClose()
    }
    
    return result
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="새 퀘스트 생성"
      size="lg"
    >
      <QuestForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  )
}
