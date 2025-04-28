"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import ConfirmationModal from "@/components/confirmation-modal"
import { useToast } from "@/hooks/use-toast"

// Interface para o histórico de edições
interface EditHistoryEntry {
  timestamp: string
  editor?: string // Para uso futuro com autenticação
}

export default function SaveQuizModal({
  onClose,
}: {
  onClose: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { questions, themeColor, previewThemeColor, customLogo, viewMode, currentQuizId, buttonRounded, buttonStyle } =
    useQuizStore()
  const [quizName, setQuizName] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalQuizData, setOriginalQuizData] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState<string>("Pesquisa salva com sucesso!")
  const [nameExists, setNameExists] = useState(false)

  // Carregar dados da pesquisa atual se estiver editando
  useEffect(() => {
    if (currentQuizId) {
      try {
        const savedQuizzes = localStorage.getItem("savedQuizzes")
        if (savedQuizzes) {
          const quizzes = JSON.parse(savedQuizzes)
          const currentQuiz = quizzes.find((quiz: any) => quiz.id === currentQuizId)
          if (currentQuiz) {
            setQuizName(currentQuiz.name || "")
            setQuizDescription(currentQuiz.description || "")
            setIsEditing(true)
            setOriginalQuizData(currentQuiz)
          }
        }
      } catch (error) {
        console.error("Error loading current quiz data:", error)
      }
    }
  }, [currentQuizId])

  // Modificar a função checkNameExists para ignorar a pesquisa atual quando estiver verificando duplicatas
  const checkNameExists = (name: string): boolean => {
    try {
      const savedQuizzes = localStorage.getItem("savedQuizzes")
      if (savedQuizzes) {
        const quizzes = JSON.parse(savedQuizzes)
        // Importante: ignorar a pesquisa atual ao verificar duplicatas
        return quizzes.some(
          (quiz: any) => quiz.name.toLowerCase() === name.toLowerCase() && quiz.id !== currentQuizId, // Não considerar a própria pesquisa como duplicata
        )
      }
    } catch (error) {
      console.error("Error checking quiz name:", error)
    }
    return false
  }

  // Também precisamos modificar o useEffect que verifica o nome para considerar o caso de edição
  useEffect(() => {
    if (quizName.trim()) {
      const exists = checkNameExists(quizName)
      setNameExists(exists)
      if (exists) {
        setError("Já existe uma pesquisa com este nome. Por favor, escolha outro nome.")
      } else {
        setError(null)
      }
    }
  }, [quizName, currentQuizId]) // Adicionar currentQuizId como dependência

  const handleSave = () => {
    if (!quizName.trim()) {
      setError("Nome da pesquisa é obrigatório")
      return
    }

    if (nameExists) {
      setError("Já existe uma pesquisa com este nome. Por favor, escolha outro nome.")
      return
    }

    // Se estiver editando uma pesquisa existente, mostrar confirmação
    if (isEditing) {
      setIsConfirmModalOpen(true)
      return
    }

    // Se for uma nova pesquisa, salvar diretamente
    saveQuiz()
  }

  const saveQuiz = () => {
    setIsSaving(true)
    setError(null)

    try {
      const { questions, previewThemeColor, customLogo, viewMode, buttonRounded, buttonStyle } = useQuizStore.getState()

      // Verificar se já existe uma pesquisa com este ID
      const savedQuizzes = localStorage.getItem("savedQuizzes")
      const quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : []

      // Preparar o histórico de edições
      let editHistory: EditHistoryEntry[] = []

      if (isEditing && originalQuizData) {
        // Se já existe um histórico, mantê-lo
        editHistory = originalQuizData.editHistory || []

        // Adicionar nova entrada ao histórico
        editHistory.push({
          timestamp: new Date().toISOString(),
          editor: "current_user", // Para uso futuro com autenticação
        })
      }

      const newQuiz = {
        id: currentQuizId || Date.now().toString(),
        name: quizName,
        description: quizDescription,
        createdAt: isEditing && originalQuizData ? originalQuizData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions,
        themeColor: previewThemeColor,
        customLogo,
        viewMode,
        buttonRounded,
        buttonStyle,
        status: isEditing && originalQuizData ? originalQuizData.status || "draft" : "draft",
        views: isEditing && originalQuizData ? originalQuizData.views || 0 : 0,
        responses: isEditing && originalQuizData ? originalQuizData.responses || 0 : 0,
        editHistory,
      }

      // Se já existe uma pesquisa com este ID, atualizá-la
      const existingQuizIndex = quizzes.findIndex((q: any) => q.id === newQuiz.id)
      if (existingQuizIndex !== -1) {
        quizzes[existingQuizIndex] = newQuiz
        setSuccessMessage("Pesquisa atualizada com sucesso!")
      } else {
        quizzes.push(newQuiz)
        setSuccessMessage("Nova pesquisa criada com sucesso!")
      }

      localStorage.setItem("savedQuizzes", JSON.stringify(quizzes))

      // Atualizar o ID da pesquisa atual
      if (!currentQuizId) {
        localStorage.setItem("currentQuizId", newQuiz.id)
      }

      setSaveSuccess(true)

      // Mostrar toast de sucesso
      toast({
        title: isEditing ? "Pesquisa atualizada!" : "Pesquisa criada!",
        description: isEditing
          ? "Suas alterações foram salvas com sucesso."
          : "Sua nova pesquisa foi criada com sucesso.",
        variant: "success",
      })

      // Definir um temporizador para redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error)
      setError("Erro ao salvar pesquisa. Tente novamente.")
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar sua pesquisa. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? "Atualizar Pesquisa" : "Salvar Pesquisa"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {saveSuccess ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">{isEditing ? "Pesquisa Atualizada!" : "Pesquisa Salva!"}</h3>
            <p className="text-[#667085]">{successMessage}</p>
            <p className="text-[#667085] mt-2">Redirecionando para o dashboard...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {isEditing && (
                <div className="bg-blue-50 p-3 rounded-md flex items-start mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p>
                      Você está editando a pesquisa <strong>"{originalQuizData?.name}"</strong>.
                    </p>
                    <p className="mt-1">As alterações serão salvas na mesma pesquisa, mantendo seu ID e histórico.</p>
                    {originalQuizData?.updatedAt && (
                      <p className="mt-1 text-xs">
                        Última atualização: {new Date(originalQuizData.updatedAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="quiz-name">Nome da Pesquisa</Label>
                <Input
                  id="quiz-name"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="Ex: Pesquisa de Satisfação"
                  className={`mt-1 ${nameExists ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>

              <div>
                <Label htmlFor="quiz-description">Descrição (opcional)</Label>
                <Textarea
                  id="quiz-description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta pesquisa"
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || nameExists}
                style={{ backgroundColor: previewThemeColor }}
              >
                {isSaving ? "Salvando..." : isEditing ? "Atualizar Pesquisa" : "Salvar Pesquisa"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            setIsConfirmModalOpen(false)
            saveQuiz()
          }}
          onCancel={() => setIsConfirmModalOpen(false)}
          title="Atualizar Pesquisa"
          message={`Tem certeza que deseja atualizar a pesquisa "${originalQuizData?.name}"? As alterações substituirão a versão atual.`}
          confirmText="Atualizar"
          cancelText="Cancelar"
        />
      )}
    </div>
  )
}
