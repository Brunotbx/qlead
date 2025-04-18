"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { type ComponentType, useQuizStore } from "@/lib/store"
import ConfirmationModal from "./confirmation-modal"

export default function ComponentsList() {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <DraggableComponent
          type="multiple-choice"
          label="Múltipla Escolha"
          setShowConfirmation={setShowConfirmation}
          setSelectedComponentType={setSelectedComponentType}
        />
        <DraggableComponent
          type="image"
          label="Imagem"
          setShowConfirmation={setShowConfirmation}
          setSelectedComponentType={setSelectedComponentType}
        />
        <DraggableComponent
          type="video"
          label="Vídeo"
          setShowConfirmation={setShowConfirmation}
          setSelectedComponentType={setSelectedComponentType}
        />
        <DraggableComponent
          type="text"
          label="Texto"
          setShowConfirmation={setShowConfirmation}
          setSelectedComponentType={setSelectedComponentType}
        />
        <DraggableComponent
          type="long-text"
          label="Texto longo"
          setShowConfirmation={setShowConfirmation}
          setSelectedComponentType={setSelectedComponentType}
        />
      </div>

      <ComponentChangeConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        componentType={selectedComponentType}
      />
    </>
  )
}

function DraggableComponent({
  type,
  label,
  setShowConfirmation,
  setSelectedComponentType,
}: {
  type: ComponentType
  label: string
  setShowConfirmation: (show: boolean) => void
  setSelectedComponentType: (type: ComponentType) => void
}) {
  const { addComponentToActiveQuestion, activeQuestionId, questions } = useQuizStore()

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { type },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ dropped: boolean }>()
      if (item && dropResult?.dropped) {
        handleComponentAdd()
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const handleComponentAdd = () => {
    // Verificar se existe uma questão ativa
    if (activeQuestionId) {
      const activeQuestion = questions.find((q) => q.id === activeQuestionId)

      // Se a questão ativa tem um tipo diferente do componente selecionado
      if (activeQuestion && activeQuestion.componentType !== type) {
        setSelectedComponentType(type)
        setShowConfirmation(true)
        return
      }
    }

    // Se não há questão ativa ou o tipo é o mesmo, adiciona diretamente
    addComponentToActiveQuestion(type)
  }

  return (
    <div
      ref={drag}
      className="flex flex-col items-center justify-center p-3 bg-white border border-[#e6e6e6] rounded-md hover:bg-[#f9fafb] transition-colors cursor-grab"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleComponentAdd}
    >
      <div className="mb-1 text-[#ff9811]">
        {type === "multiple-choice" && <MultipleChoiceIcon />}
        {type === "image" && <ImageIcon />}
        {type === "video" && <VideoIcon />}
        {type === "text" && <TextIcon />}
        {type === "long-text" && <LongTextIcon />}
      </div>
      <span className="text-xs text-[#667085]">{label}</span>
    </div>
  )
}

function ComponentChangeConfirmation({
  isOpen,
  onClose,
  componentType,
}: {
  isOpen: boolean
  onClose: () => void
  componentType: ComponentType | null
}) {
  const { addComponentToActiveQuestion, addQuestion } = useQuizStore()

  if (!componentType) return null

  const handleChangeType = () => {
    addComponentToActiveQuestion(componentType)
    onClose()
  }

  const handleCreateNew = () => {
    addQuestion(componentType)
    onClose()
  }

  const getComponentName = (type: ComponentType) => {
    switch (type) {
      case "multiple-choice":
        return "Múltipla Escolha"
      case "image":
        return "Imagem"
      case "video":
        return "Vídeo"
      case "text":
        return "Texto"
      case "long-text":
        return "Texto longo"
    }
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleChangeType}
      onCancel={handleCreateNew}
      title="Alterar tipo de questão"
      message={`Deseja alterar o tipo da questão atual para ${getComponentName(componentType)}?`}
      confirmText="Alterar tipo"
      cancelText="Criar nova questão"
    />
  )
}

// Icons
export function MultipleChoiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="14" height="3" rx="1" fill="currentColor" />
      <rect x="3" y="9" width="14" height="3" rx="1" fill="currentColor" />
      <rect x="3" y="14" width="14" height="3" rx="1" fill="currentColor" />
    </svg>
  )
}

export function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <path
        d="M4 14L7 11L9 13L13 9L16 12V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8L13 10L8 12V8Z" fill="currentColor" />
    </svg>
  )
}

export function TextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function LongTextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
