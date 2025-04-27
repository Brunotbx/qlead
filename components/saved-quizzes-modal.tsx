"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Edit, ExternalLink } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export default function SavedQuizzesModal({
  isOpen,
  onClose,
  onQuizzesSaved,
}: {
  isOpen: boolean
  onClose: () => void
  onQuizzesSaved?: () => void
}) {
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([])
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)
  const { loadSavedQuiz, resetQuiz } = useQuizStore()

  // Carregar pesquisas salvas quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      loadSavedQuizzes()
    }
  }, [isOpen])

  const loadSavedQuizzes = () => {
    try {
      const savedData = localStorage.getItem("savedQuizzes")
      if (savedData) {
        const quizzes = JSON.parse(savedData)
        setSavedQuizzes(quizzes)
      } else {
        setSavedQuizzes([])
      }
    } catch (error) {
      console.error("Error loading saved quizzes:", error)
      setSavedQuizzes([])
    }
  }

  const handleLoadQuiz = (quizId: string) => {
    loadSavedQuiz(quizId)
    onClose()
    if (onQuizzesSaved) {
      onQuizzesSaved()
    }
  }

  const handleDeleteQuiz = (quizId: string) => {
    setQuizToDelete(quizId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteQuiz = () => {
    if (!quizToDelete) return

    try {
      // Obter as pesquisas salvas
      const savedData = localStorage.getItem("savedQuizzes")
      if (savedData) {
        // Converter para objeto JavaScript
        const quizzes = JSON.parse(savedData)

        // Filtrar a pesquisa a ser excluída
        const updatedQuizzes = quizzes.filter((quiz: any) => quiz.id !== quizToDelete)

        // Salvar a lista atualizada de volta no localStorage
        localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes))

        // Atualizar o estado local
        setSavedQuizzes(updatedQuizzes)

        // Remover também as respostas associadas
        localStorage.removeItem(`quizResponses_${quizToDelete}`)

        // Se a pesquisa atual foi excluída, resetar o estado
        const currentQuizId = localStorage.getItem("currentQuizId")
        if (currentQuizId === quizToDelete) {
          localStorage.removeItem("currentQuizId")
          resetQuiz()
        }

        console.log("Quiz deleted successfully:", quizToDelete)
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
    }

    // Fechar o modal de confirmação
    setIsDeleteConfirmOpen(false)
    setQuizToDelete(null)

    // Notificar o componente pai
    if (onQuizzesSaved) {
      onQuizzesSaved()
    }
  }

  // Modifique a função handleOpenPublicView para garantir que as questões sejam carregadas corretamente
  const handleOpenPublicView = (quizId: string) => {
    try {
      console.log("Iniciando abertura da visualização pública para quiz ID:", quizId)

      const savedData = localStorage.getItem("savedQuizzes")
      if (!savedData) {
        console.error("Nenhuma pesquisa salva encontrada")
        alert("Nenhuma pesquisa salva encontrada.")
        return
      }

      const quizzes = JSON.parse(savedData)
      const quiz = quizzes.find((q: any) => q.id === quizId)

      if (!quiz) {
        console.error("Pesquisa não encontrada com ID:", quizId)
        alert("Pesquisa não encontrada.")
        return
      }

      console.log("Pesquisa encontrada:", quiz.name)

      // Verificar se a pesquisa tem questões
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        console.error("A pesquisa não contém um array de questões válido")
        alert("Esta pesquisa não contém questões válidas. Por favor, edite a pesquisa primeiro.")
        return
      }

      if (quiz.questions.length === 0) {
        console.error("A pesquisa não contém questões")
        alert("Esta pesquisa não contém questões. Adicione questões antes de visualizar.")
        return
      }

      // Limpar quaisquer dados de preview anteriores
      localStorage.removeItem("quizPreviewData")

      // Criar um objeto simplificado para a visualização pública
      // Remover qualquer referência a componentes React ou funções que possam causar problemas
      const previewData = {
        questions: quiz.questions.map((q: any) => ({
          ...q,
          // Remover quaisquer propriedades que possam conter referências a componentes React
          // ou funções que não podem ser serializadas
          ref: undefined,
          handlers: undefined,
        })),
        currentIndex: 0,
        previewThemeColor: quiz.themeColor || "#ff9811",
        customLogo: quiz.customLogo,
        viewMode: quiz.viewMode || "mobile",
        buttonRounded: quiz.buttonRounded || false,
        buttonStyle: quiz.buttonStyle || "primary",
        timestamp: Date.now(),
        quizId: quizId,
      }

      // Salvar os dados no localStorage
      localStorage.setItem("quizPreviewData", JSON.stringify(previewData))

      console.log("Dados de preview salvos com sucesso. Número de questões:", quiz.questions.length)

      // Garantir que a cor do tema seja aplicada na visualização pública
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--theme-color", quiz.themeColor || "#ff9811")
      }

      // Abrir em uma nova aba com um pequeno atraso para garantir que os dados sejam salvos
      setTimeout(() => {
        window.open("/quiz-public", "_blank")
      }, 100)
    } catch (error) {
      console.error("Erro ao abrir visualização pública:", error)
      alert("Ocorreu um erro ao abrir a visualização pública. Verifique o console para mais detalhes.")
    }
  }

  const handleCreateNewQuiz = () => {
    resetQuiz()
    onClose()
    if (onQuizzesSaved) {
      onQuizzesSaved()
    }
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Contar respostas para cada pesquisa
  const getResponseCount = (quizId: string) => {
    try {
      const responsesData = localStorage.getItem(`quizResponses_${quizId}`)
      if (responsesData) {
        const responses = JSON.parse(responsesData)
        return responses.length
      }
      return 0
    } catch (error) {
      console.error("Error counting responses:", error)
      return 0
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pesquisas Salvas</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {savedQuizzes.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-[#f9fafb] text-[#344054]">
                    <th className="px-4 py-3 text-left font-medium w-1/5">Nome</th>
                    <th className="px-4 py-3 text-left font-medium w-1/5">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium w-1/5">Data de Criação</th>
                    <th className="px-4 py-3 text-center font-medium w-1/10">Respostas</th>
                    <th className="px-4 py-3 text-center font-medium w-3/10">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {savedQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-t border-[#e6e6e6]">
                      <td className="px-4 py-3 truncate">{quiz.name}</td>
                      <td className="px-4 py-3 text-[#667085] truncate">{quiz.description || "-"}</td>
                      <td className="px-4 py-3 text-[#667085] whitespace-nowrap">{formatDate(quiz.createdAt)}</td>
                      <td className="px-4 py-3 text-center">{getResponseCount(quiz.id)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadQuiz(quiz.id)}
                            className="text-[#667085] hover:text-[#344054]"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPublicView(quiz.id)}
                            className="text-[#667085] hover:text-[#344054]"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver público
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[#667085]">Nenhuma pesquisa salva.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleCreateNewQuiz} style={{ backgroundColor: "var(--theme-color)" }}>
            Novo Quiz
          </Button>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Excluir Pesquisa</h2>
            <p className="text-[#667085] mb-6">
              Tem certeza que deseja excluir esta pesquisa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmDeleteQuiz} className="bg-red-500 hover:bg-red-600 text-white">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
