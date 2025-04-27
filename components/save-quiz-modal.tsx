"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SaveQuizModal({
  onClose,
}: {
  onClose: () => void
}) {
  const { questions, themeColor, previewThemeColor, customLogo, viewMode, currentQuizId } = useQuizStore()
  const [quizName, setQuizName] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Carregar dados da pesquisa atual se estiver editando
  useState(() => {
    if (currentQuizId) {
      try {
        const savedQuizzes = localStorage.getItem("savedQuizzes")
        if (savedQuizzes) {
          const quizzes = JSON.parse(savedQuizzes)
          const currentQuiz = quizzes.find((quiz: any) => quiz.id === currentQuizId)
          if (currentQuiz) {
            setQuizName(currentQuiz.name || "")
            setQuizDescription(currentQuiz.description || "")
          }
        }
      } catch (error) {
        console.error("Error loading current quiz data:", error)
      }
    }
  })

  // Modificar a função de salvar pesquisa para incluir a configuração de botões arredondados
  const handleSave = () => {
    if (!quizName.trim()) {
      setError("Nome da pesquisa é obrigatório")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const {
        questions,
        previewThemeColor, // Usar previewThemeColor em vez de themeColor
        customLogo,
        viewMode,
        buttonRounded,
        buttonStyle,
      } = useQuizStore.getState()

      // Verificar se já existe uma pesquisa com este ID
      const savedQuizzes = localStorage.getItem("savedQuizzes")
      const quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : []

      const newQuiz = {
        id: currentQuizId || Date.now().toString(),
        name: quizName,
        description: quizDescription,
        createdAt: new Date().toISOString(),
        questions,
        themeColor: previewThemeColor, // Usar previewThemeColor para garantir que a cor personalizada seja salva
        customLogo,
        viewMode,
        buttonRounded,
        buttonStyle,
      }

      // Se já existe uma pesquisa com este ID, atualizá-la
      const existingQuizIndex = quizzes.findIndex((q: any) => q.id === newQuiz.id)
      if (existingQuizIndex !== -1) {
        quizzes[existingQuizIndex] = newQuiz
      } else {
        quizzes.push(newQuiz)
      }

      localStorage.setItem("savedQuizzes", JSON.stringify(quizzes))

      // Atualizar o ID da pesquisa atual
      if (!currentQuizId) {
        localStorage.setItem("currentQuizId", newQuiz.id)
      }

      setSaveSuccess(true)

      // Definir um temporizador para recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error)
      setError("Erro ao salvar pesquisa. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Salvar Pesquisa</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {saveSuccess ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <Save className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Pesquisa Salva!</h3>
            <p className="text-[#667085]">Sua pesquisa foi salva com sucesso.</p>
            <p className="text-[#667085] mt-2">Recarregando página...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="quiz-name">Nome da Pesquisa</Label>
                <Input
                  id="quiz-name"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="Ex: Pesquisa de Satisfação"
                  className="mt-1"
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
              <Button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: previewThemeColor }}>
                {isSaving ? "Salvando..." : "Salvar Pesquisa"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
