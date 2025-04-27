"use client"

import type React from "react"

import { MultipleChoiceIcon, ImageIcon, VideoIcon, TextIcon, LongTextIcon } from "./components-list"

interface EmptyStateProps {
  onAddComponent: (type: "multiple-choice" | "image" | "video" | "text" | "long-text") => void
}

export default function EmptyState({ onAddComponent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[500px]">
      <h2 className="text-xl font-semibold text-[#101828] mb-2">Selecione um componente!</h2>
      <p className="text-[#667085] mb-8 text-center">
        Você poderá alterar detalhes de seus componentes na aba direita.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <ComponentCard
          icon={<MultipleChoiceIcon />}
          label="Múltipla Escolha"
          onClick={() => onAddComponent("multiple-choice")}
        />
        <ComponentCard icon={<ImageIcon />} label="Imagem" onClick={() => onAddComponent("image")} />
        <ComponentCard icon={<VideoIcon />} label="Vídeo" onClick={() => onAddComponent("video")} />
        <ComponentCard icon={<TextIcon />} label="Texto" onClick={() => onAddComponent("text")} />
        <ComponentCard icon={<LongTextIcon />} label="Texto longo" onClick={() => onAddComponent("long-text")} />
      </div>
    </div>
  )
}

interface ComponentCardProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function ComponentCard({ icon, label, onClick }: ComponentCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-white border border-[#e6e6e6] rounded-md hover:border-[#ff9811] hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="text-[#ff9811] mb-3">{icon}</div>
      <span className="text-sm text-[#344054]">{label}</span>
    </div>
  )
}
