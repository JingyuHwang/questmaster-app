import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { QuestForm } from './QuestForm'
import { useQuests } from '@/hooks/useQuests'
import type { CreateQuestData } from '@/lib/types'

interface CreateQuestModalProps {
  isOpen: boolean
  onClose: () => void
  onQuestCreated?: () => void
}

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  isOpen,
  onClose,
  onQuestCreated
}) => {
  const { createQuest, loading } = useQuests()

  const handleSubmit = async (data: CreateQuestData) => {
    const result = await createQuest(data)
    
    if (result.success) {
      // 퀘스트 생성 성공 시 부모 컴포넌트에 알림
      if (onQuestCreated) {
        onQuestCreated()
      }
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
