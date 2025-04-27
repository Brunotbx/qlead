"use client"

import { useQuizStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { MultipleChoiceIcon, ImageIcon, VideoIcon, TextIcon, LongTextIcon } from "./components-list"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function QuestionsList() {
  const { questions, activeQuestionId, setActiveQuestion, removeQuestion } = useQuizStore()

  if (questions.length === 0) {
    return <div className="text-center py-4 text-sm text-[#667085]">Nenhuma questão adicionada</div>
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          id={question.id}
          title={question.title}
          type={question.componentType}
          active={question.id === activeQuestionId}
          onClick={() => setActiveQuestion(question.id)}
          onDelete={() => removeQuestion(question.id)}
        />
      ))}
    </div>
  )
}

function QuestionItem({
  id,
  title,
  type,
  active = false,
  onClick,
  onDelete,
}: {
  id: string
  title: string
  type: string
  active?: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-md cursor-pointer group",
        active ? "bg-[#fff4e5]" : "hover:bg-[#f2f4f7]",
      )}
    >
      <div
        className={cn("flex-1 flex items-center gap-2", active ? "text-[#ff9811]" : "text-[#98a2b3]")}
        onClick={onClick}
      >
        <div className={active ? "text-[#ff9811]" : "text-[#98a2b3]"}>
          {type === "multiple-choice" && <MultipleChoiceIcon />}
          {type === "image" && <ImageIcon />}
          {type === "video" && <VideoIcon />}
          {type === "text" && <TextIcon />}
          {type === "long-text" && <LongTextIcon />}
        </div>
        <span className={cn("text-xs truncate max-w-[140px]", active ? "text-[#ff9811]" : "text-[#667085]")}>
          {title}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 opacity-0 group-hover:opacity-100 text-[#667085] hover:text-red-500 hover:bg-transparent"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
