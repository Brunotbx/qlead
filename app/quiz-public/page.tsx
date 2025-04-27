"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useQuizStore, type Question } from "@/lib/store"
import { Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import QuizQuestionPublic from "@/components/quiz-question-public"
import ErrorBoundary from "@/components/error-boundary"

type Answer = {
  questionId: string
  value: string | string[] | null
  componentType: string
}

// Extrair o store para fora do componente para evitar chamadas condicionais
const getStoreData = () => {
  try {
    const store = useQuizStore.getState()
    return {
      storeQuestions: store.questions,
      storeThemeColor: store.previewThemeColor,
      storeCustomLogo: store.customLogo,
      storeButtonRounded: store.buttonRounded,
      storeButtonStyle: store.buttonStyle,
    }
  } catch (error) {
    console.error("Erro ao acessar o store:", error)
    return {
      storeQuestions: [],
      storeThemeColor: "#ff9811",
      storeCustomLogo: null,
      storeButtonRounded: false,
      storeButtonStyle: "primary",
    }
  }
}

// Adicione esta função para determinar o placeholder com base no tipo/máscara
function getPlaceholder(input: any) {
  if (input.type === "email") {
    return "email@exemplo.com"
  } else if (input.mask === "(99) 99999-9999" || input.mask === "(99) 9999-9999") {
    return "(00) 00000-0000"
  } else if (input.mask === "99/99/9999") {
    return "dd/mm/aaaa"
  } else if (input.mask === "999.999.999-99") {
    return "000.000.000-00"
  } else if (input.mask === "99.999.999/9999-99") {
    return "00.000.000/0000-00"
  } else if (input.mask === "99999-999") {
    return "00000-000"
  }
  return input.placeholder || "Insira sua resposta aqui"
}

export default function QuizPublic() {
  // Estados
  const [questions, setQuestions] = useState<Question[]>([])
  const [previewThemeColor, setPreviewThemeColor] = useState<string>("#ff9811")
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonActive, setButtonActive] = useState(true)
  const [startTime, setStartTime] = useState(Date.now())
  const [buttonRounded, setButtonRounded] = useState<boolean>(false)
  const [buttonStyle, setButtonStyle] = useState<"primary" | "secondary">("primary")
  const [isLoading, setIsLoading] = useState(true)
  const [timerRemaining, setTimerRemaining] = useState<number>(0)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [storeData, setStoreData] = useState(() => getStoreData()) // Initialize with initial store data
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Tratamento de erro global para capturar problemas de renderização
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Erro capturado:", error)
      setRenderError("Ocorreu um erro ao renderizar a pesquisa. Por favor, tente novamente.")
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  // Se houver um erro de renderização, mostrar mensagem amigável
  if (renderError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md">
          <h2 className="text-xl font-bold mb-4">Erro na Pesquisa</h2>
          <p className="text-center py-4 text-[#667085]">{renderError}</p>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-[#ff9811] text-white rounded-md" onClick={() => window.close()}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Carregar dados do localStorage - otimizado com useCallback
  const loadQuizData = useCallback(() => {
    try {
      setIsLoading(true)
      console.log("Iniciando carregamento de dados...")

      // Tentar carregar dados do localStorage
      const savedData = localStorage.getItem("quizPreviewData")

      if (savedData) {
        console.log("Dados encontrados no localStorage")
        const parsedData = JSON.parse(savedData)

        if (parsedData.questions && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
          console.log(`Número de questões encontradas: ${parsedData.questions.length}`)

          // Limpar quaisquer propriedades que possam causar problemas
          const cleanedQuestions = parsedData.questions.map((q: any) => ({
            ...q,
            // Remover propriedades problemáticas
            ref: undefined,
            handlers: undefined,
          }))

          // Dados encontrados no localStorage
          setQuestions(cleanedQuestions)
          setPreviewThemeColor(parsedData.previewThemeColor || "#ff9811")
          setCustomLogo(parsedData.customLogo || null)
          setButtonRounded(parsedData.buttonRounded || false)
          setButtonStyle(parsedData.buttonStyle || "primary")

          // Definir a variável CSS para a cor do tema
          if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--theme-color", parsedData.previewThemeColor || "#ff9811")
          }

          console.log("Dados carregados com sucesso do localStorage")
          setIsLoading(false)
          return
        } else {
          console.error("Dados inválidos encontrados no localStorage:", parsedData)
        }
      } else {
        console.log("Nenhum dado encontrado no localStorage")
      }

      // Fallback para o store se não encontrar no localStorage
      console.log("Tentando carregar dados do store...")
      // const { storeQuestions, storeThemeColor, storeCustomLogo, storeButtonRounded, storeButtonStyle } = getStoreData()
      const { storeQuestions, storeThemeColor, storeCustomLogo, storeButtonRounded, storeButtonStyle } = storeData

      if (storeQuestions && storeQuestions.length > 0) {
        console.log(`Número de questões encontradas no store: ${storeQuestions.length}`)
        setQuestions(storeQuestions)
        setPreviewThemeColor(storeThemeColor)
        setCustomLogo(storeCustomLogo)
        setButtonRounded(storeButtonRounded)
        setButtonStyle(storeButtonStyle)

        // Definir a variável CSS para a cor do tema
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--theme-color", storeThemeColor || "#ff9811")
        }

        console.log("Dados carregados com sucesso do store")
      } else {
        console.error("Nenhuma questão encontrada no store")
        setError("Nenhuma questão encontrada. Por favor, crie uma pesquisa primeiro.")
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setError("Erro ao carregar dados. Por favor, tente novamente.")

      // Em caso de erro, usar valores padrão
      setQuestions([])
      setPreviewThemeColor("#ff9811")
      setButtonRounded(false)
      setButtonStyle("primary")

      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--theme-color", "#ff9811")
      }
    } finally {
      setIsLoading(false)
    }
  }, [storeData])

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadQuizData()
    setIsMounted(true)

    // Adicionar um estilo global para a cor do tema
    const style = document.createElement("style")
    style.innerHTML = `
      :root {
        --theme-color: ${previewThemeColor || "#ff9811"};
      }
    `
    document.head.appendChild(style)

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [loadQuizData, previewThemeColor])

  // Inicializar respostas vazias para todas as questões
  useEffect(() => {
    if (questions.length > 0) {
      const initialAnswers = questions.map((q) => ({
        questionId: q.id,
        value: q.componentType === "multiple-choice" ? [] : null,
        componentType: q.componentType,
      }))
      setAnswers(initialAnswers)
    }
  }, [questions])

  // Questão atual - memoizada para evitar recálculos desnecessários
  const currentQuestion = useMemo(
    () => (questions.length > 0 && currentIndex < questions.length ? questions[currentIndex] : null),
    [questions, currentIndex],
  )

  // Implementar o timer do botão
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    let intervalId: NodeJS.Timeout | null = null

    // Reset timer values
    setButtonActive(true)
    setTimerRemaining(0)

    if (currentQuestion && currentQuestion.config.buttonTimer && currentQuestion.config.buttonTimer > 0) {
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

  // Função para avançar para a próxima questão - otimizada com useCallback
  const handleNext = useCallback(() => {
    if (!currentQuestion) return

    // Verificar se a questão atual é obrigatória e foi respondida
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

      // Salvar as respostas
      try {
        const quizId = localStorage.getItem("currentQuizId")
        if (quizId) {
          const responsesKey = `quizResponses_${quizId}`
          const existingResponses = localStorage.getItem(responsesKey)
          const newResponse = {
            answers,
            timestamp: new Date().toISOString(),
          }

          if (existingResponses) {
            const responses = JSON.parse(existingResponses)
            responses.push(newResponse)
            localStorage.setItem(responsesKey, JSON.stringify(responses))
          } else {
            localStorage.setItem(responsesKey, JSON.stringify([newResponse]))
          }

          console.log("Respostas salvas com sucesso")
        }
      } catch (error) {
        console.error("Erro ao salvar respostas:", error)
      }
    }
  }, [currentQuestion, answers, currentIndex, questions.length, validationError])

  // Função para voltar para a questão anterior - otimizada com useCallback
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setError(null)
    }
  }, [currentIndex])

  // Função para atualizar a resposta - otimizada com useCallback
  const updateAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, value } : a)))
    setError(null)
  }, [])

  // Função para lidar com erros de validação
  const handleValidationError = useCallback((error: string | null) => {
    setValidationError(error)
  }, [])

  // Renderizar o ícone com base na posição configurada - memoizado
  const renderIcon = useMemo(() => {
    if (!currentQuestion || !currentQuestion.config.showIcon || !currentQuestion.icon) return null

    const iconPosition = currentQuestion.config.iconPosition || "center"

    return (
      <div
        className={`mb-4 flex ${
          iconPosition === "left" ? "justify-start" : iconPosition === "right" ? "justify-end" : "justify-center"
        }`}
      >
        <img
          src={currentQuestion.icon || "/placeholder.svg"}
          alt="Ícone da questão"
          className="w-12 h-12"
          style={{ color: previewThemeColor }}
        />
      </div>
    )
  }, [currentQuestion, previewThemeColor])

  // Resposta atual - memoizada
  const currentAnswer = useMemo(
    () => (currentQuestion ? answers.find((a) => a.questionId === currentQuestion.id) : null),
    [currentQuestion, answers],
  )

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">Carregando pesquisa...</h2>
          <div className="w-full bg-[#f2f4f7] rounded-full h-2">
            <div className="h-2 rounded-full bg-[#ff9811] animate-pulse" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Tela de erro quando não há questões
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md">
          <h2 className="text-xl font-bold mb-4">Pesquisa</h2>
          <p className="text-center py-8 text-[#667085]">Nenhuma questão adicionada à pesquisa</p>
          <div className="flex justify-end mt-4">
            <Button onClick={() => window.close()}>Fechar</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isMounted) {
    return null // or a loading indicator
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md">
            <h2 className="text-xl font-bold mb-4">Erro na Pesquisa</h2>
            <p className="text-center py-4 text-[#667085]">
              Ocorreu um erro ao carregar a pesquisa. Por favor, tente novamente.
            </p>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-[#ff9811] text-white rounded-md" onClick={() => window.close()}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-[#f2f4f7] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-[500px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col">
            {!completed ? (
              // Tela de questão
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
                {currentQuestion && (
                  <div className="flex-1 overflow-y-auto px-8">
                    {/* Ícone com posição configurável */}
                    {renderIcon}

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
                )}

                {/* Button - Always at the bottom */}
                <div className="mt-auto px-8 pb-4 flex-shrink-0">
                  {currentQuestion && currentQuestion.config.showButton ? (
                    <Button
                      className={`w-full py-6 flex items-center justify-center gap-2 ${
                        buttonStyle === "secondary" ? "bg-transparent border" : ""
                      }`}
                      style={{
                        backgroundColor: buttonStyle === "primary" ? previewThemeColor : "transparent",
                        borderRadius: buttonRounded ? "9999px" : "0.375rem",
                        color: buttonStyle === "primary" ? "white" : previewThemeColor,
                        borderColor: buttonStyle === "secondary" ? previewThemeColor : previewThemeColor,
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
              // Tela final
              <div className="p-0 overflow-hidden flex flex-col h-full">
                {/* Header com logo e progresso */}
                <div className="px-8 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-lg">
                      <span className="text-black">quiz</span>
                      <span style={{ color: previewThemeColor }}>lead</span>
                    </div>
                    <span className="text-xs text-[#667085]">
                      {questions.length} de {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-[#f2f4f7] rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: previewThemeColor,
                        width: "100%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Conteúdo principal - Tela de agradecimento simplificada */}
                <div className="px-8 py-4 flex-1 flex flex-col items-center justify-center text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Obrigado por participar!</h2>
                    <p className="text-[#667085]">Sua resposta foi registrada com sucesso.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
