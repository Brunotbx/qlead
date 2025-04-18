"use client"

import type React from "react"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Eye, Home, ChevronRight, Plus, Star, Smartphone, Palette, Monitor } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import ComponentsList from "@/components/components-list"
import QuestionsList from "@/components/questions-list"
import QuestionPreview from "@/components/question-preview"
import ConfigPanel from "@/components/config-panel"
import PreviewModal from "@/components/preview-modal"
import { Button } from "@/components/ui/button"
import ThemeCustomizer from "@/components/theme-customizer"
import EmptyState from "@/components/empty-state"

export default function QuizEditor() {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const { questions, activeQuestionId, setActiveQuestion, addQuestion, viewMode, setViewMode, themeColor } =
    useQuizStore()

  const activeQuestion = questions.find((q) => q.id === activeQuestionId)
  const hasQuestions = questions.length > 0

  const handleAddNewQuestion = () => {
    addQuestion("text")
  }

  const handleAddFinalScreen = () => {
    addQuestion("text")
  }

  const handleAddComponent = (type: "multiple-choice" | "image" | "video" | "text" | "long-text") => {
    addQuestion(type)
  }

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
              <span>Nome do projeto</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-color)] text-white rounded-md"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <Eye className="w-4 h-4" />
              <span>Pré-visualizar</span>
            </button>
            <span className="text-[#667085]">OR</span>
          </div>
        </header>

        {/* Main Content */}
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
              {hasQuestions && (
                <>
                  <div className="mb-4">
                    <h2 className="font-medium text-[#344054] mb-4">Visualização</h2>
                  </div>
                  <div className="flex flex-col space-y-2 bg-[#f9fafb] p-2 rounded-md mb-4">
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
                </>
              )}
              <button
                className="flex items-center justify-center w-full gap-2 p-3 text-sm text-[#667085] border border-dashed border-[#d0d5dd] rounded-md hover:bg-[#f9fafb] transition-colors"
                onClick={handleAddFinalScreen}
              >
                <Star className="w-4 h-4" />
                <span>Adicionar tela final</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className={`flex justify-center ${viewMode === "mobile" ? "bg-[#f2f4f7] p-4 rounded-lg" : ""}`}>
              <div
                className={
                  viewMode === "mobile"
                    ? "w-[375px] h-[667px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
                    : "w-full"
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

      {isPreviewModalOpen && <PreviewModal onClose={() => setIsPreviewModalOpen(false)} viewMode={viewMode} />}
      {isThemeCustomizerOpen && <ThemeCustomizer onClose={() => setIsThemeCustomizerOpen(false)} />}
    </DndProvider>
  )
}
