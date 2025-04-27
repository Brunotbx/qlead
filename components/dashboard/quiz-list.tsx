"use client"

import { Edit, Eye, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuizListProps {
  quizzes: any[]
  onEdit: (id: string) => void
  onPublish: (quiz: any) => void
  formatDate: (date: string) => string
}

export default function QuizList({ quizzes, onEdit, onPublish, formatDate }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-[#667085]">
        <p>Nenhuma pesquisa encontrada.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#e6e6e6]">
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Visualizações</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Respostas</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Conversão</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-[#667085]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id} className="border-b border-[#e6e6e6] hover:bg-[#f9fafb]">
              <td className="px-4 py-3 text-sm text-[#101828]">{quiz.name}</td>
              <td className="px-4 py-3">
                {quiz.status === "published" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
                    Publicada
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-500"></span>
                    Rascunho
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-[#667085]">{formatDate(quiz.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-[#667085]">{quiz.views}</td>
              <td className="px-4 py-3 text-sm text-[#667085]">{quiz.responses}</td>
              <td className="px-4 py-3 text-sm text-[#667085]">{quiz.conversionRate}%</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(quiz.id)}
                          className="h-8 w-8 text-[#667085]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar pesquisa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/quiz-public?id=${quiz.id}`, "_blank")}
                          className="h-8 w-8 text-[#667085]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visualizar pesquisa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Simplificar o objeto quiz antes de passar para o modal
                            const simplifiedQuiz = {
                              id: quiz.id,
                              name: quiz.name,
                              status: quiz.status,
                              publishedUrl: quiz.publishedUrl || "",
                              password: quiz.password || "",
                              responseLimit: quiz.responseLimit || 0,
                              expirationDate: quiz.expirationDate || null,
                            }
                            onPublish(simplifiedQuiz)
                          }}
                          className="h-8 w-8 text-[#667085]"
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{quiz.status === "published" ? "Editar publicação" : "Publicar pesquisa"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
