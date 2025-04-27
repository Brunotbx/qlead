"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {
  Eye,
  Home,
  ChevronRight,
  Plus,
  Smartphone,
  Palette,
  Monitor,
  LogOut,
  Save,
  BarChart2,
  FilePlus,
} from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import ComponentsList from "@/components/components-list"
import QuestionsList from "@/components/questions-list"
import QuestionPreview from "@/components/question-preview"
import ConfigPanel from "@/components/config-panel"
import PreviewModal from "@/components/preview-modal"
import { Button } from "@/components/ui/button"
import ThemeCustomizer from "@/components/theme-customizer"
import EmptyState from "@/components/empty-state"
import SaveQuizModal from "@/components/save-quiz-modal"

export default function QuizEditor() {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [hasSavedQuizzes, setHasSavedQuizzes] = useState(false)
  const [currentQuizName, setCurrentQuizName] = useState<string | null>(null)
  const {
    questions,
    activeQuestionId,
    setActiveQuestion,
    addQuestion,
    viewMode,
    setViewMode,
    themeColor,
    customLogo,
    updateLocalStorage,
    resetQuiz,
    currentQuizId,
  } = useQuizStore()
  const { user, logout } = useAuth()

  const activeQuestion = questions.find((q) => q.id === activeQuestionId)
  const hasQuestions = questions.length > 0
  const buttonRounded = "0.375rem"

  // Verificar se existem pesquisas salvas ao carregar o componente
  useEffect(() => {
    checkForSavedQuizzes()
    loadCurrentQuizName()
  }, [currentQuizId])

  // Função para verificar se existem pesquisas salvas - otimizada com useCallback
  const checkForSavedQuizzes = useCallback(() => {
    try {
      const savedData = localStorage.getItem("savedQuizzes")
      if (savedData) {
        const quizzes = JSON.parse(savedData)
        setHasSavedQuizzes(quizzes.length > 0)
      } else {
        setHasSavedQuizzes(false)
      }
    } catch (error) {
      console.error("Error checking for saved quizzes:", error)
      setHasSavedQuizzes(false)
    }
  }, [])

  // Função para carregar o nome da pesquisa atual - otimizada com useCallback
  const loadCurrentQuizName = useCallback(() => {
    if (!currentQuizId) {
      setCurrentQuizName(null)
      return
    }

    try {
      const savedData = localStorage.getItem("savedQuizzes")
      if (savedData) {
        const quizzes = JSON.parse(savedData)
        const currentQuiz = quizzes.find((quiz: any) => quiz.id === currentQuizId)
        if (currentQuiz) {
          setCurrentQuizName(currentQuiz.name)
        } else {
          setCurrentQuizName(null)
        }
      } else {
        setCurrentQuizName(null)
      }
    } catch (error) {
      console.error("Error loading current quiz name:", error)
      setCurrentQuizName(null)
    }
  }, [currentQuizId])

  const handleAddNewQuestion = useCallback(() => {
    addQuestion("text")
  }, [addQuestion])

  const handleAddComponent = useCallback(
    (type: "multiple-choice" | "image" | "video" | "text" | "long-text") => {
      addQuestion(type)
    },
    [addQuestion],
  )

  const handleOpenPublicView = useCallback(() => {
    // Salvar o estado atual no localStorage antes de abrir a nova aba
    const previewData = {
      questions,
      currentIndex: 0,
      previewThemeColor: themeColor,
      customLogo,
      viewMode,
      timestamp: Date.now(),
      quizId: localStorage.getItem("currentQuizId") || null, // Add quiz ID if available
    }

    localStorage.setItem("quizPreviewData", JSON.stringify(previewData))

    // Abrir a nova aba após garantir que os dados foram salvos
    setTimeout(() => {
      window.open("/quiz-public", "_blank")
    }, 100)
  }, [questions, themeColor, customLogo, viewMode])

  const handleCreateNewQuiz = useCallback(() => {
    // Usar a função resetQuiz do store para limpar o estado
    resetQuiz()
    setCurrentQuizName(null)
  }, [resetQuiz])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen" style={{ "--theme-color": themeColor } as React.CSSProperties}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl">
              <span className="text-black">quiz</span>
              <span className="text-[var(--theme-color)]">lead</span>
            </div>
            <div className="flex items-center text-sm text-[#667085]">
              <Home className="w-4 h-4 mr-1" />
              <ChevronRight className="w-3 h-3 mx-1" />
              {currentQuizName ? (
                <span className="font-medium text-[var(--theme-color)]">{currentQuizName}</span>
              ) : (
                <span>Nome do projeto</span>
              )}
            </div>

            {/* Botões de preview e visualização pública */}
            <div className="flex items-center gap-2 ml-4">
              {hasQuestions && (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-color)] text-white rounded-md"
                    onClick={() => {
                      // Salvar o estado atual no localStorage antes de abrir a modal
                      updateLocalStorage()
                      setIsPreviewModalOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Pré-visualizar</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                    onClick={() => setIsSaveModalOpen(true)}
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </>
              )}

              {/* Mostrar o botão "Novo Quiz" apenas se existirem pesquisas salvas */}
              {hasSavedQuizzes && (
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                  onClick={handleCreateNewQuiz}
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Novo Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Moved user info and logout to the right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <span>Olá, {user?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1 text-[#667085] hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Rest of the component remains unchanged */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-[#f9f9f9] border-r border-[#e6e6e6] overflow-y-auto">
            <div className="p-6">
              <h2 className="font-medium text-[#344054] mb-4">Componentes</h2>
              <ComponentsList />
            </div>

            <div className="p-6 border-t border-[#e6e6e6]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-[#344054]">Questões</h2>
                <button className="text-[#667085] hover:text-[var(--theme-color)]" onClick={handleAddNewQuestion}>
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <QuestionsList />
            </div>

            <div className="p-6 border-t border-[#e6e6e6]">
              <div className="mb-4">
                <h2 className="font-medium text-[#344054] mb-4">Visualização</h2>
              </div>
              <div className="flex flex-col space-y-2 bg-[#f9fafb] p-2 rounded-md mb-4">
                {/* Opção de Dashboard */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="justify-start text-[#667085]"
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                {/* Mostrar opções de visualização mobile/desktop apenas se houver questões */}
                {hasQuestions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "mobile" ? "desktop" : "mobile")}
                    className="justify-start text-[#667085]"
                  >
                    {viewMode === "mobile" ? (
                      <>
                        <Monitor className="w-4 h-4 mr-2" />
                        Desktop
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsThemeCustomizerOpen(true)}
                  className="justify-start text-[#667085]"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div
              className={`flex justify-center ${hasQuestions && viewMode === "mobile" ? "bg-[#f2f4f7] p-4 rounded-lg" : ""}`}
            >
              <div
                className={
                  hasQuestions && viewMode === "mobile"
                    ? "w-[375px] h-[667px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
                    : "w-[500px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
                }
              >
                {hasQuestions && activeQuestion ? (
                  <QuestionPreview question={activeQuestion} viewMode={viewMode} />
                ) : (
                  <EmptyState onAddComponent={handleAddComponent} />
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          {activeQuestion && <ConfigPanel question={activeQuestion} />}
        </div>
      </div>

      {isPreviewModalOpen && <PreviewModal onClose={() => setIsPreviewModalOpen(false)} />}
      {isThemeCustomizerOpen && <ThemeCustomizer onClose={() => setIsThemeCustomizerOpen(false)} />}
      {isSaveModalOpen && (
        <SaveQuizModal
          onClose={() => {
            setIsSaveModalOpen(false)
            // Recarregar o nome da pesquisa após salvar
            loadCurrentQuizName()
          }}
        />
      )}
    </DndProvider>
  )
}
