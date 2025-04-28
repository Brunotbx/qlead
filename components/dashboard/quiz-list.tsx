"use client"

import { memo } from "react"
import QuizListItem from "./quiz-list-item"
import QuizListSkeleton from "./quiz-list-skeleton"

interface QuizListProps {
  quizzes: any[]
  onEdit: (quizId: string) => void
  onPublish: (quiz: any) => void
  onDelete: (quizId: string) => void
  onDuplicate: (quizId: string) => void
  formatDate: (date: string) => string
  isLoading: boolean
}

const QuizList = memo(({ quizzes, onEdit, onPublish, onDelete, onDuplicate, formatDate, isLoading }: QuizListProps) => {
  if (isLoading) {
    return <QuizListSkeleton />
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#667085]">Nenhuma pesquisa encontrada.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-[#f9fafb] text-[#344054]">
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Data de Criação</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Visualizações</th>
            <th className="px-4 py-3 text-left font-medium">Respostas</th>
            <th className="px-4 py-3 text-left font-medium">Conversão</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <QuizListItem
              key={quiz.id}
              quiz={quiz}
              onEdit={onEdit}
              onPublish={onPublish}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
})

QuizList.displayName = "QuizList"

export default QuizList
