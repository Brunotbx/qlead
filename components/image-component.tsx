"use client"

import type React from "react"
import { useState } from "react"

interface ImageComponentProps {
  question: {
    title: string
    subtitle?: string
  }
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubtitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpdateQuestion: (updatedQuestion: any) => void
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  question,
  onTitleChange,
  onSubtitleChange,
  onUpdateQuestion,
}) => {
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isSubtitleFocused, setIsSubtitleFocused] = useState(false)

  return (
    <div>
      <input
        value={question.title}
        onChange={onTitleChange}
        onFocus={(e) => {
          setIsTitleFocused(true)
          if (e.target.value === "Escreva aqui o título da sua questão") {
            // Atualize o título para string vazia na primeira interação
            const updatedQuestion = { ...question, title: "" }
            onUpdateQuestion(updatedQuestion)
          }
        }}
        className="text-xl font-semibold text-[#101828] w-full p-2 outline-none bg-transparent"
        placeholder="Escreva aqui o título da sua questão"
        onBlur={() => setIsTitleFocused(false)}
      />

      <input
        value={question.subtitle || ""}
        onChange={onSubtitleChange}
        onFocus={(e) => {
          setIsSubtitleFocused(true)
          if (e.target.value === "Subtítulo da questão (opcional)") {
            // Atualize o subtítulo para string vazia na primeira interação
            const updatedQuestion = { ...question, subtitle: "" }
            onUpdateQuestion(updatedQuestion)
          }
        }}
        className="text-[#667085] w-full p-2 outline-none bg-transparent"
        placeholder="Subtítulo da questão (opcional)"
        onBlur={() => setIsSubtitleFocused(false)}
      />
    </div>
  )
}

export default ImageComponent
