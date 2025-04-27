"use client"

import { useEffect, useState, useRef } from "react"
import { useQuizStore, type Question } from "@/lib/store"
import { Check, AlertCircle, ArrowRight, ChevronLeft, ChevronRight, User, Phone, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import SummaryView from "@/components/summary-view"

type Answer = {
  questionId: string
  value: string | string[] | null
  componentType: string
}

export default function QuizPreview() {
  const { questions: storeQuestions, previewThemeColor: storeThemeColor, customLogo: storeLogo } = useQuizStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [previewThemeColor, setPreviewThemeColor] = useState<string>("#ff9811")
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonActive, setButtonActive] = useState(true)
  const viewMode = "mobile" // Sempre usar visualização mobile
  const [startTime, setStartTime] = useState(Date.now())
  // Modificar o componente para usar a configuração global de botões arredondados
  // Carregar a configuração de botões arredondados do localStorage
  const [buttonRounded, setButtonRounded] = useState<boolean>(false)
  // Add the buttonStyle state
  const [buttonStyle, setButtonStyle] = useState<"primary" | "secondary">("primary")

  // Modificar o useEffect que carrega os dados do localStorage
  useEffect(() => {
    const loadQuizData = () => {
      const savedData = localStorage.getItem("quizPreviewData")

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          if (parsedData.questions && parsedData.questions.length > 0) {
            setQuestions(parsedData.questions)
            setPreviewThemeColor(parsedData.previewThemeColor || "#ff9811")
            setCustomLogo(parsedData.customLogo || null)
            setButtonRounded(parsedData.buttonRounded || false) // Carregar a configuração de botões arredondados
            setButtonStyle(parsedData.buttonStyle || "primary") // Add this line
          } else {
            // Fallback para os dados do store
            const {
              questions: storeQuestions,
              previewThemeColor: storeThemeColor,
              customLogo: storeLogo,
              buttonRounded: storeButtonRounded,
              buttonStyle: storeButtonStyle, // Add this line
            } = useQuizStore.getState()
            setQuestions(storeQuestions)
            setPreviewThemeColor(storeThemeColor)
            setCustomLogo(storeLogo)
            setButtonRounded(storeButtonRounded)
            setButtonStyle(storeButtonStyle) // Add this line
          }
        } catch (e) {
          console.error("Erro ao carregar dados do preview:", e)
          // Fallback para os dados do store
          const {
            questions: storeQuestions,
            previewThemeColor: storeThemeColor,
            customLogo: storeLogo,
            buttonRounded: storeButtonRounded,
          } = useQuizStore.getState()
          setQuestions(storeQuestions)
          setPreviewThemeColor(storeThemeColor)
          setCustomLogo(storeLogo)
          setButtonRounded(storeButtonRounded)
        }
      } else {
        // Fallback para os dados do store
        const {
          questions: storeQuestions,
          previewThemeColor: storeThemeColor,
          customLogo: storeLogo,
          buttonRounded: storeButtonRounded,
          buttonStyle: storeButtonStyle, // Add this line
        } = useQuizStore.getState()
        setQuestions(storeQuestions)
        setPreviewThemeColor(storeThemeColor)
        setCustomLogo(storeLogo)
        setButtonRounded(storeButtonRounded)
        setButtonStyle(storeButtonStyle) // Add this line
      }
    }

    // Carregar dados inicialmente
    loadQuizData()

    // Configurar um listener para verificar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "quizPreviewData") {
        loadQuizData()
      }
    }

    // Adicionar listener para mudanças no localStorage
    window.addEventListener("storage", handleStorageChange)

    // Configurar um intervalo para verificar atualizações periodicamente
    const checkInterval = setInterval(loadQuizData, 2000)

    // Limpar listener e intervalo quando o componente for desmontado
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(checkInterval)
    }
  }, [storeQuestions, storeThemeColor, storeLogo])

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

  // Implementar o timer do botão
  useEffect(() => {
    if (currentQuestion?.config.buttonTimer && currentQuestion.config.buttonTimer > 0) {
      setButtonActive(false)
      // Reset the start time
      setStartTime(Date.now())

      // Criar um intervalo para atualizar o contador a cada segundo
      const interval = setInterval(() => {
        // Forçar atualização do componente para mostrar o tempo restante
        setStartTime((prevTime) => {
          // Manter o mesmo valor, mas forçar re-renderização
          return Date.now() - (Date.now() - prevTime)
        })
      }, 1000)

      const timer = setTimeout(() => {
        setButtonActive(true)
        clearInterval(interval)
      }, currentQuestion.config.buttonTimer * 1000)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      setButtonActive(true)
    }
  }, [currentIndex, currentQuestion?.config.buttonTimer, currentQuestion])

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
    setError(null)
  }

  const resetPreview = () => {
    setCurrentIndex(0)
    setCompleted(false)
    setError(null)
    const initialAnswers = questions.map((q) => ({
      questionId: q.id,
      value: q.componentType === "multiple-choice" ? [] : null,
      componentType: q.componentType,
    }))
    setAnswers(initialAnswers)
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md">
          <h2 className="text-xl font-bold mb-4">Pré-visualização</h2>
          <p className="text-center py-8 text-[#667085]">Nenhuma questão adicionada ao quiz</p>
          <div className="flex justify-end mt-4">
            <Button onClick={() => window.close()}>Fechar</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)

  // Renderizar o ícone com base na posição configurada
  const renderIcon = (question: Question) => {
    if (!question.config.showIcon || !question.icon) return null

    const iconPosition = question.config.iconPosition || "center"

    return (
      <div
        className={`mb-4 flex ${
          iconPosition === "left" ? "justify-start" : iconPosition === "right" ? "justify-end" : "justify-center"
        }`}
      >
        <img
          src={question.icon || "/placeholder.svg"}
          alt="Ícone da questão"
          className="w-12 h-12"
          style={{ color: previewThemeColor }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white border-b border-[#e6e6e6]">
        <h2 className="text-xl font-bold">Pré-visualização</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.close()} className="text-[#667085]">
            Fechar
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 flex items-center justify-center p-4 ${viewMode === "mobile" ? "bg-[#f2f4f7]" : "bg-[#f2f4f7]"}`}
      >
        <div
          className={
            viewMode === "mobile"
              ? "w-[375px] h-[700px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col"
              : "w-[500px] max-w-full bg-white rounded-md shadow-sm overflow-hidden flex flex-col" // Changed from w-full max-w-[600px] to w-[500px]
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
                {/* Ícone com posição configurável */}
                {renderIcon(currentQuestion)}

                <QuizQuestionPreview
                  question={currentQuestion}
                  answer={currentAnswer?.value}
                  onAnswer={(value) => updateAnswer(currentQuestion.id, value)}
                />

                {error && (
                  <div className="mt-2 text-red-500 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Button - Always at the bottom */}
              {currentQuestion.config.showButton && (
                <div className="mt-auto px-8 pb-4 flex-shrink-0">
                  {currentQuestion.config.buttonRedirect && currentQuestion.config.buttonLink ? (
                    <a
                      href={currentQuestion.config.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                      onClick={(e) => {
                        // Prevenir navegação no modo preview, mas manter o comportamento de avançar
                        e.preventDefault()
                        handleNext()
                      }}
                    >
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
                      >
                        {!buttonActive && currentQuestion.config.buttonTimer
                          ? `Aguarde ${Math.ceil((currentQuestion.config.buttonTimer * 1000 - (Date.now() - startTime)) / 1000)}s...`
                          : currentQuestion.config.buttonText || "Continuar"}
                      </Button>
                    </a>
                  ) : (
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
                      {!buttonActive && currentQuestion.config.buttonTimer
                        ? `Aguarde ${Math.ceil((currentQuestion.config.buttonTimer * 1000 - (Date.now() - startTime)) / 1000)}s...`
                        : currentQuestion.config.buttonText || "Continuar"}
                      {buttonActive && currentQuestion.config.buttonShowIcon && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              )}

              {!currentQuestion.config.showButton && (
                <div className="flex justify-between p-4 border-t">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>

                  <Button
                    onClick={handleNext}
                    style={{ backgroundColor: previewThemeColor }}
                    className="hover:opacity-90"
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
            </>
          ) : (
            <div className="p-8 overflow-y-auto">
              <SummaryView answers={answers} questions={questions} />
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={resetPreview} className="mr-4">
                  Reiniciar Pesquisa
                </Button>
                <Button
                  onClick={() => window.close()}
                  style={{ backgroundColor: previewThemeColor }}
                  className="hover:opacity-90"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuizQuestionPreview({
  question,
  answer,
  onAnswer,
}: {
  question: Question
  answer: string | string[] | null
  onAnswer: (value: string | string[]) => void
}) {
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const { previewThemeColor } = useQuizStore()

  // Função para extrair o ID do vídeo do YouTube da URL
  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return ""

    // Verificar se é um YouTube Short
    const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/
    const shortsMatch = url.match(shortsRegExp)

    if (shortsMatch && shortsMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${shortsMatch[2]}`
    }

    // Padrões de URL do YouTube padrão
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : ""
  }

  // Verificar se o título e subtítulo foram editados pelo usuário
  const defaultSubtitle = "Subtítulo da questão (opcional)"
  const isSubtitleDefault = question.subtitle === defaultSubtitle || !question.subtitle

  // Função para renderizar o emoji correto
  const renderEmoji = (iconName: string) => {
    switch (iconName) {
      case "sad":
        return "🙁"
      case "happy":
        return "😀"
      case "smile":
        return "🙂"
      case "angry":
        return "😡"
      case "thumbsup":
        return "👍"
      case "thumbsdown":
        return "👎"
      default:
        return "🙂"
    }
  }

  // Check if we're showing an image in full mode
  const isFullImageMode =
    question.componentType === "image" && question.imageUrl && question.config.imagePosition === "full"

  // Render a specific element based on its type for the preview
  const renderImageElement = (element: any) => {
    if (!element) return null

    switch (element.type) {
      case "image":
        if (question.imageUrl) {
          return (
            <div className="relative mt-4 mb-4">
              <div className="h-[200px]">
                <img
                  src={question.imageUrl || "/placeholder.svg"}
                  alt="Background"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          )
        }
        return null
      case "title":
        if (question.config.showTitles) {
          return (
            <div className="mb-4">
              <h3 className="text-xl font-semibold">{question.title}</h3>
              {question.subtitle && !isSubtitleDefault && <p className="text-[#667085]">{question.subtitle}</p>}
            </div>
          )
        }
        return null
      case "cta":
        if (question.config.showImageCta) {
          return (
            <div className={`mb-4 ${question.config.ctaFullWidth ? "" : "flex justify-center"}`}>
              <Button
                className={`py-2 px-4 text-white ${question.config.ctaFullWidth ? "" : "w-full"}`}
                style={{
                  backgroundColor: previewThemeColor,
                  borderRadius: question.config.buttonRounded ? "9999px" : "0.375rem",
                }}
              >
                {question.config.imageCta?.text || "Saiba mais"}
              </Button>
            </div>
          )
        }
        return null
      case "input":
        if (question.config.showImageInput) {
          return (
            <div className="mb-4">
              <textarea
                value={(answer as string) || ""}
                onChange={(e) => onAnswer(e.target.value)}
                placeholder="Adicione um comentário sobre a imagem..."
                className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none"
              />
            </div>
          )
        }
        return null
      default:
        return null
    }
  }

  if (isFullImageMode) {
    return (
      <div className="h-full flex flex-col relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={question.imageUrl || "/placeholder.svg"} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content on top of the image */}
        <div className="relative z-10 flex flex-col h-full text-white p-4">
          <div className="flex-shrink-0">
            {question.config.showTitles && (
              <>
                <h3
                  className="text-xl font-semibold break-words overflow-hidden"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    width: "100%",
                  }}
                >
                  {question.title}
                </h3>
                {question.subtitle && !isSubtitleDefault && (
                  <p
                    className="text-white/80 break-words overflow-hidden"
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                      width: "100%",
                    }}
                  >
                    {question.subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          {/* CTA button if enabled */}
          {question.config.showImageCta && (
            <div className={`mt-4 ${question.config.ctaFullWidth ? "" : "flex justify-center"}`}>
              <Button
                className={`py-2 px-4 text-white border border-white ${question.config.ctaFullWidth ? "w-full" : ""}`}
                style={{
                  backgroundColor: "transparent",
                  borderRadius: question.config.buttonRounded ? "9999px" : "0.375rem",
                }}
              >
                {question.config.imageCta?.text || "Saiba mais"}
              </Button>
            </div>
          )}

          {/* Show text input only if enabled */}
          {question.config.showImageInput && (
            <div className="flex-1 overflow-y-auto py-4">
              <textarea
                value={(answer as string) || ""}
                onChange={(e) => onAnswer(e.target.value)}
                placeholder="Adicione um comentário sobre a imagem..."
                className="w-full border border-white/30 rounded-md p-3 min-h-[100px] resize-none bg-transparent text-white placeholder:text-white/70"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0">
        {question.config.showTitles && question.componentType !== "image" && (
          <>
            <h3
              className="text-xl font-semibold break-words overflow-hidden"
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                width: "100%",
              }}
            >
              {question.title}
            </h3>
            {question.subtitle && !isSubtitleDefault && (
              <p
                className="text-[#667085] break-words overflow-hidden"
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  width: "100%",
                }}
              >
                {question.subtitle}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {question.componentType === "multiple-choice" && (
          <div className="space-y-2">
            {(question.options || []).map((option, index) => {
              const isSelected = Array.isArray(answer) && answer.includes(option.id)

              return (
                <div
                  key={option.id}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    isSelected ? "border-[var(--theme-color)]" : "border-[#e6e6e6] hover:border-[#d0d5dd]"
                  } ${question.config.centerContent ? "justify-center" : "justify-between"}`}
                  onClick={() => {
                    if (question.config.multipleSelection) {
                      const currentAnswers = Array.isArray(answer) ? answer : []
                      const newAnswers = currentAnswers.includes(option.id)
                        ? currentAnswers.filter((a) => a !== option.id)
                        : [...currentAnswers, option.id]
                      onAnswer(newAnswers)
                    } else {
                      onAnswer([option.id])
                    }
                  }}
                  style={{
                    borderColor: isSelected ? previewThemeColor : "#e6e6e6",
                    backgroundColor: isSelected ? `${previewThemeColor}10` : undefined,
                    borderRadius: "12px",
                  }}
                >
                  <div className={`flex items-center gap-3 ${question.config.centerContent ? "text-center" : ""}`}>
                    <span className="break-words">{option.text}</span>
                  </div>
                  {question.config.showIcon && (
                    <span className="text-lg flex-shrink-0 ml-2">{renderEmoji(option.icon)}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {question.componentType === "image" && (
          <div className="h-full flex flex-col">
            {question.imageUrl && question.config.imagePosition === "top" ? (
              <>
                {/* Render elements in the order defined by imageElements */}
                {question.imageElements?.map((element) => renderImageElement(element))}
              </>
            ) : (
              <div className="border rounded-md p-4 text-center">
                <div className="aspect-video bg-[#f2f4f7] flex items-center justify-center rounded-md">
                  <p className="text-[#667085]">Imagem</p>
                </div>
                <div className="mt-4">
                  <textarea
                    value={(answer as string) || ""}
                    onChange={(e) => onAnswer(e.target.value)}
                    placeholder="Adicione um comentário sobre a imagem..."
                    className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {question.componentType === "video" && (
          <div className="flex flex-col gap-4">
            {question.config.videoSize === "full" ? (
              <div className="h-full flex flex-col w-full bg-black">
                <div
                  ref={videoContainerRef}
                  className="relative flex-1 flex items-center justify-center overflow-hidden"
                  style={{ height: "calc(100% - 120px)" }}
                >
                  {question.youtubeUrl ? (
                    <div
                      className={`${question.config.videoFormat === "portrait" ? "h-full" : "w-full"} flex items-center justify-center overflow-hidden rounded-lg`}
                      style={{ overflow: "hidden" }}
                    >
                      <iframe
                        src={getYoutubeEmbedUrl(question.youtubeUrl)}
                        className={
                          question.config.videoFormat === "portrait"
                            ? "h-full max-h-[calc(100vh-180px)] rounded-lg"
                            : "w-full rounded-lg"
                        }
                        style={{
                          ...(question.config.videoFormat === "portrait"
                            ? { aspectRatio: "9/16", maxHeight: "100%" }
                            : { aspectRatio: "16/9" }),
                          overflow: "hidden",
                          border: "none",
                        }}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white rounded-lg">
                      <p>Vídeo em tela cheia</p>
                    </div>
                  )}
                </div>
                {!question.config.hideDescription && (
                  <div
                    className={`p-4 ${question.config.centerDescription ? "text-center" : ""} bg-black text-white flex-shrink-0`}
                  >
                    <p className="text-white/80 mb-2">{question.videoDescription || "O que você achou do vídeo?"}</p>
                    <textarea
                      value={(answer as string) || ""}
                      onChange={(e) => onAnswer(e.target.value)}
                      placeholder="Digite seu comentário aqui..."
                      className="w-full bg-white/10 border border-white/20 rounded-md p-3 min-h-[80px] resize-none text-white placeholder:text-white/50"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Sempre mostrar o vídeo no topo - modificado para ocupar todo o espaço */}
                <div className="w-full overflow-hidden">
                  {question.youtubeUrl ? (
                    <div className="w-full overflow-hidden rounded-lg">
                      <iframe
                        src={getYoutubeEmbedUrl(question.youtubeUrl)}
                        className="w-full rounded-lg"
                        style={{
                          ...(question.config.videoFormat === "portrait"
                            ? { aspectRatio: "9/16" }
                            : { aspectRatio: "16/9" }),
                          overflow: "hidden",
                          border: "none",
                        }}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video bg-[#f2f4f7] flex items-center justify-center rounded-lg">
                      <p className="text-[#667085]">Vídeo</p>
                    </div>
                  )}
                </div>
                {!question.config.hideDescription && (
                  <div className={`w-full ${question.config.centerDescription ? "text-center" : ""}`}>
                    <p className="text-[#667085] mb-2">{question.videoDescription || "O que você achou do vídeo?"}</p>
                    <textarea
                      value={(answer as string) || ""}
                      onChange={(e) => onAnswer(e.target.value)}
                      placeholder="Digite seu comentário aqui..."
                      className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {question.componentType === "text" && (
          <div className="space-y-2">
            {question.inputs.map((input, index) => {
              // Para múltiplos inputs, vamos armazenar as respostas como um objeto JSON stringificado
              const inputAnswers = typeof answer === "string" && answer.startsWith("{") ? JSON.parse(answer) : {}

              return (
                <div key={index} className="border border-[#d0d5dd] rounded-md p-3 flex items-center">
                  {question.config.showIcon && (
                    <div className="mr-2 text-[#667085]">
                      {input.iconType === "text" && <User className="w-5 h-5" />}
                      {input.iconType === "phone" && <Phone className="w-5 h-5" />}
                      {input.iconType === "email" && <AtSign className="w-5 h-5" />}
                    </div>
                  )}
                  <input
                    type={input.type === "email" ? "email" : input.type === "phone" ? "tel" : "text"}
                    value={inputAnswers[input.id] || ""}
                    placeholder={input.placeholder}
                    className="w-full outline-none"
                    onChange={(e) => {
                      const newInputAnswers = { ...inputAnswers, [input.id]: e.target.value }
                      onAnswer(JSON.stringify(newInputAnswers))
                    }}
                  />
                </div>
              )
            })}
            {question.inputs.length === 0 && (
              <div className="border border-[#d0d5dd] rounded-md p-3">
                <input
                  type="text"
                  value={(answer as string) || ""}
                  placeholder="Insira sua resposta aqui"
                  className="w-full outline-none"
                  onChange={(e) => onAnswer(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {question.componentType === "long-text" && (
          <div className="space-y-2">
            <textarea
              value={(answer as string) || ""}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="Digite seu texto aqui..."
              className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none"
              maxLength={
                question.config.maxChars
                  ? Number.parseInt(question.config.maxCharsValue.split("-")[1]?.trim() || "500", 10)
                  : undefined
              }
            />
            {question.config.maxChars && (
              <div className="text-right text-sm text-[#667085]">
                {Number.parseInt(question.config.maxCharsValue.split("-")[1]?.trim() || "500", 10) -
                  ((answer as string) || "").length}{" "}
                caracteres restantes
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
