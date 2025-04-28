"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Question } from "@/lib/store"

interface QuizResponsesListProps {
  responses: any[]
  questions: Question[]
  formatDate: (date: string) => string
}

export default function QuizResponsesList({ responses, questions, formatDate }: QuizResponsesListProps) {
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar respostas com base no termo de pesquisa
  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true

    // Verificar se alguma resposta contém o termo de pesquisa
    return response.answers.some((answer: any) => {
      // Encontrar a questão correspondente
      const question = questions.find((q) => q.id === answer.questionId)

      // Verificar se o título da questão ou a resposta contém o termo de pesquisa
      return (
        (question && question.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (answer.value && answer.value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  })

  const toggleExpand = (responseId: string) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId)
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085] w-4 h-4" />
          <Input
            placeholder="Buscar nas respostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredResponses.length > 0 ? (
          filteredResponses.map((response) => (
            <div key={response.id} className="border rounded-lg overflow-hidden">
              <div
                className="bg-[#f9fafb] px-4 py-3 border-b flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(response.id)}
              >
                <div className="font-medium">Resposta #{response.id ? response.id.substring(0, 8) : "sem-id"}</div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#667085]">{formatDate(response.submittedAt)}</span>
                  {expandedResponse === response.id ? (
                    <ChevronUp className="w-4 h-4 text-[#667085]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#667085]" />
                  )}
                </div>
              </div>

              {expandedResponse === response.id && (
                <div className="p-4">
                  <div className="space-y-4">
                    {response.answers.map((answer: any) => {
                      // Encontrar a questão correspondente
                      const question = questions.find((q) => q.id === answer.questionId)

                      if (!question) return null

                      return (
                        <div key={answer.questionId} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="font-medium mb-1">{question.title}</div>
                          <div className="text-[#667085]">
                            {answer.value ? (
                              <span>{answer.value}</span>
                            ) : (
                              <span className="text-[#d1d5db] italic">Sem resposta</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-[#667085]">Nenhuma resposta encontrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
