"use client"

import { memo } from "react"
import { Edit, Globe, Trash2, Copy, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

interface QuizListItemProps {
  quiz: any
  onEdit: (quizId: string) => void
  onPublish: (quiz: any) => void
  onDelete: (quizId: string) => void
  onDuplicate: (quizId: string) => void
  formatDate: (date: string) => string
}

const QuizListItem = memo(({ quiz, onEdit, onPublish, onDelete, onDuplicate, formatDate }: QuizListItemProps) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/dashboard/${quiz.id}`)
  }

  // Verificar se a pesquisa foi atualizada recentemente (nas últimas 24 horas)
  const isRecentlyUpdated = () => {
    if (!quiz.updatedAt) return false
    const updatedDate = new Date(quiz.updatedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime())
    const diffHours = diffTime / (1000 * 60 * 60)
    return diffHours < 24
  }

  // Formatar a data de atualização para exibição
  const getUpdatedTimeAgo = () => {
    if (!quiz.updatedAt) return ""

    const updatedDate = new Date(quiz.updatedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`
    } else {
      return `${diffDays}d atrás`
    }
  }

  return (
    <tr className={`border-b border-[#e6e6e6] hover:bg-gray-50 ${isRecentlyUpdated() ? "bg-yellow-50" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span
              className="font-medium text-[#101828] hover:text-[var(--theme-color)] cursor-pointer"
              onClick={handleViewDetails}
            >
              {quiz.name}
            </span>
            {isRecentlyUpdated() && (
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Atualizada {getUpdatedTimeAgo()}
              </Badge>
            )}
          </div>
          {quiz.description && <span className="text-sm text-[#667085] line-clamp-1">{quiz.description}</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#667085]">
        <div className="flex flex-col">
          <span>{formatDate(quiz.createdAt)}</span>
          {quiz.updatedAt && quiz.updatedAt !== quiz.createdAt && (
            <span className="text-xs text-[#667085]">Atualizada: {formatDate(quiz.updatedAt)}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={`${
            quiz.status === "published"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          {quiz.status === "published" ? "Publicada" : "Rascunho"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-[#667085]">{quiz.views}</td>
      <td className="px-4 py-3 text-sm text-[#667085]">{quiz.responses}</td>
      <td className="px-4 py-3 text-sm text-[#667085]">{quiz.conversionRate}%</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleViewDetails}>
                  <ExternalLink className="h-4 w-4 text-[#667085]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalhes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onEdit(quiz.id)}>
                  <Edit className="h-4 w-4 text-[#667085]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDuplicate(quiz.id)}>
                  <Copy className="h-4 w-4 text-[#667085]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onPublish(quiz)}>
                  <Globe className="h-4 w-4 text-[#667085]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{quiz.status === "published" ? "Gerenciar publicação" : "Publicar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(quiz.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  )
})

QuizListItem.displayName = "QuizListItem"

export default QuizListItem
