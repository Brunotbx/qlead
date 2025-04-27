"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import SummaryView from "./summary-view"
import QuizQuestionPublic from "./quiz-question-public"

type Answer = {
  questionId: string
  value: string | string[] | null
  componentType: string
}

export default function PreviewModal({
  onClose,
}: {
  onClose: () => void
}) {
  const { questions, previewThemeColor, customLogo, buttonRounded, buttonStyle } = useQuizStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const viewMode = "mobile" // Sempre usar visualização mobile
  const [startTime, setStartTime] = useState(Date.now())
  const [buttonActive, setButtonActive] = useState(true)
  const [timerRemaining, setTimerRemaining] = useState<number>(0)

  // Inicializar respostas vazias para todas as questões
  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      const initialAnswers = questions.map((q) => ({
        questionId: q.id,
        value: q.componentType === "multiple-choice" ? [] : null,
        componentType: q.componentType,
      }))
      setAnswers(initialAnswers)
    }
  }, [questions, answers.length])

  const currentQuestion = questions[currentIndex]

  // Adicionar useEffect para implementar o timer do botão
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    let intervalId: NodeJS.Timeout | null = null

    // Reset timer values
    setButtonActive(true)
    setTimerRemaining(0)

    // Se a questão tem um timer configurado e é maior que 0
    if (currentQuestion?.config.buttonTimer && currentQuestion.config.buttonTimer > 0) {
      // Desativar o botão inicialmente
      setButtonActive(false)
      const timerDuration = currentQuestion.config.buttonTimer * 1000
      const endTime = Date.now() + timerDuration

      // Atualizar o tempo restante a cada segundo
      intervalId = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now())
        setTimerRemaining(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          setButtonActive(true)
          if (intervalId) clearInterval(intervalId)
        }
      }, 1000)

      // Definir o tempo inicial
      setTimerRemaining(currentQuestion.config.buttonTimer)

      // Configurar o timer para ativar o botão
      timerId = setTimeout(() => {
        setButtonActive(true)
        if (intervalId) clearInterval(intervalId)
      }, timerDuration)
    }

    return () => {
      if (timerId) clearTimeout(timerId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [currentIndex, currentQuestion])

  const handleNext = () => {
    // Verificar se a questão atual é obrigatória e foi respondida
    const currentQuestion = questions[currentIndex]
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

    if (currentQuestion.config.required) {
      if (
        !currentAnswer?.value ||
        (Array.isArray(currentAnswer.value) && currentAnswer.value.length === 0) ||
        (typeof currentAnswer.value === "string" && currentAnswer.value.trim() === "")
      ) {
        setError("Esta questão é obrigatória")
        return
      }
    }

    // Verificar se há erros de validação
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Chegou ao final da pesquisa
      setCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setError(null)
    }
  }

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, value } : a)))

    // Limpar mensagem de erro quando o usuário responde
    setError(null)
  }

  const handleValidationError = (error: string | null) => {
    setValidationError(error)
  }

  const resetPreview = () => {
    setCurrentIndex(0)
    setCompleted(false)
    setError(null)

    // Resetar todas as respostas
    const initialAnswers = questions.map((q) => ({
      questionId: q.id,
      value: q.componentType === "multiple-choice" ? [] : null,
      componentType: q.componentType,
    }))
    setAnswers(initialAnswers)
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pré-visualização</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center py-8 text-[#667085]">Nenhuma questão adicionada ao quiz</p>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)

  // Modificar a função handleOpenPublicView para incluir as configurações do botão
  const handleOpenPublicView = () => {
    // Salvar o estado atual no localStorage antes de abrir a nova aba
    const { questions, previewThemeColor, customLogo, viewMode, buttonRounded, buttonStyle } = useQuizStore.getState()

    const previewData = {
      questions,
      currentIndex: 0,
      previewThemeColor,
      customLogo,
      viewMode,
      buttonRounded,
      buttonStyle,
      timestamp: Date.now(),
      quizId: localStorage.getItem("currentQuizId") || null,
    }

    localStorage.setItem("quizPreviewData", JSON.stringify(previewData))

    // Abrir a nova aba após garantir que os dados foram salvos
    setTimeout(() => {
      window.open("/quiz-public", "_blank")
    }, 100)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pré-visualização</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleOpenPublicView}>
              Abrir em nova aba
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          {/* Modificar a seção do conteúdo para usar o viewMode */}
          <div
            className={`py-4 ${viewMode === "mobile" ? "bg-[#f2f4f7] p-4 rounded-lg flex justify-center" : "flex justify-center"}`}
          >
            <div
              className={
                viewMode === "mobile"
                  ? "w-[375px] h-[700px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
                  : "w-[500px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
              }
            >
              {!completed ? (
                <>
                  {/* Progress Bar with Logo - Always at the top */}
                  <div className="mb-6 px-8 pt-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-1 flex-wrap">
                      <div className="flex items-center">
                        {customLogo ? (
                          <img src={customLogo || "/placeholder.svg"} alt="Logo personalizado" className="max-h-8" />
                        ) : (
                          <div className="font-bold text-lg">
                            <span className="text-black">quiz</span>
                            <span style={{ color: previewThemeColor }}>lead</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-[#667085]">
                        {currentIndex + 1} de {questions.length}
                      </span>
                    </div>
                    <div className="w-full bg-[#f2f4f7] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: previewThemeColor,
                          width: `${((currentIndex + 1) / questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-y-auto px-8">
                    <QuizQuestionPublic
                      question={currentQuestion}
                      answer={currentAnswer?.value}
                      onAnswer={(value) => updateAnswer(currentQuestion.id, value)}
                      previewThemeColor={previewThemeColor}
                      buttonRounded={buttonRounded}
                      buttonStyle={buttonStyle}
                      onValidationError={handleValidationError}
                    />

                    {error && (
                      <div className="mt-2 text-red-500 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Button - Always at the bottom */}
                  <div className="mt-auto px-8 pb-4 flex-shrink-0">
                    {currentQuestion.config.showButton ? (
                      <Button
                        className={`w-full py-6 flex items-center justify-center gap-2 ${
                          buttonStyle === "secondary" ? "bg-transparent border" : ""
                        }`}
                        style={{
                          backgroundColor: buttonStyle === "primary" ? previewThemeColor : "transparent",
                          borderRadius: buttonRounded ? "9999px" : "0.375rem",
                          color: buttonStyle === "primary" ? "white" : previewThemeColor,
                          borderColor: buttonStyle === "secondary" ? previewThemeColor : undefined,
                          opacity: buttonActive ? 1 : 0.5,
                        }}
                        onClick={handleNext}
                        disabled={!buttonActive}
                      >
                        {!buttonActive && timerRemaining > 0
                          ? `Aguarde ${timerRemaining}s...`
                          : currentQuestion.config.buttonText || "Continuar"}
                      </Button>
                    ) : (
                      <div className="flex justify-between p-4">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Anterior
                        </Button>

                        <Button
                          onClick={handleNext}
                          style={{
                            backgroundColor: buttonStyle === "primary" ? previewThemeColor : "transparent",
                            borderRadius: buttonRounded ? "9999px" : "0.375rem",
                            color: buttonStyle === "primary" ? "white" : previewThemeColor,
                            borderColor: buttonStyle === "secondary" ? previewThemeColor : undefined,
                          }}
                          className={`hover:opacity-90 ${buttonStyle === "secondary" ? "border" : ""}`}
                        >
                          {currentIndex === questions.length - 1 ? "Finalizar" : "Próximo"}
                          {currentIndex === questions.length - 1 ? (
                            <Check className="w-4 h-4 ml-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 ml-2" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 overflow-y-auto">
                  <SummaryView answers={answers} questions={questions} />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {completed && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={resetPreview}>
              Reiniciar Pesquisa
            </Button>

            <Button onClick={onClose} style={{ backgroundColor: previewThemeColor }} className="hover:opacity-90">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
