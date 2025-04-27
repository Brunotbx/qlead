"use client"

import { useState, useEffect, useRef } from "react"
import { X, AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuizStore, type Question } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import SummaryView from "./summary-view" // Import SummaryView

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
    // Se a questão tem um timer configurado e é maior que 0
    if (currentQuestion?.config.buttonTimer && currentQuestion.config.buttonTimer > 0) {
      // Desativar o botão inicialmente
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

      // Configurar um timer para ativar o botão após o tempo especificado
      const timer = setTimeout(() => {
        clearInterval(interval)
        setButtonActive(true)
      }, currentQuestion.config.buttonTimer * 1000) // Converter segundos para milissegundos

      // Limpar o timer e o intervalo quando o componente for desmontado
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      // Se não há timer ou é 0, o botão sempre está ativo
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
        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img
            src={question.icon || "/placeholder.svg"}
            alt="Ícone da questão"
            className="max-w-full max-h-full object-contain"
            style={{ color: previewThemeColor }}
          />
        </div>
      </div>
    )
  }

  // Modificar a função handleOpenPublicView para incluir as configurações do botão

  // Localizar a função handleOpenPublicView (ou código similar) e modificar:
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
                    {/* Ícone com posição configurável */}
                    {renderIcon(currentQuestion)}

                    <InteractiveQuestionPreview
                      question={currentQuestion}
                      answer={currentAnswer?.value}
                      onAnswer={(value) => updateAnswer(currentQuestion.id, value)}
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
                            disabled={!buttonActive}
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
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 overflow-y-auto">
                  <SummaryView answers={answers} questions={questions} />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {!currentQuestion.config.showButton && !completed && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="text-[#667085]">
              {currentIndex + 1} de {questions.length}
            </div>

            <Button
              onClick={handleNext}
              style={{
                backgroundColor: previewThemeColor,
                borderRadius: buttonRounded ? "9999px" : "0.375rem",
              }}
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

function InteractiveQuestionPreview({
  question,
  answer,
  onAnswer,
  onValidationError,
}: {
  question: Question
  answer: string | string[] | null
  onAnswer: (value: string | string[]) => void
  onValidationError?: (error: string | null) => void
}) {
  // Referência para o container do vídeo para ajustar o tamanho
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const { previewThemeColor, updateQuestion, buttonRounded, buttonStyle } = useQuizStore()
  const [startTime, setStartTime] = useState(Date.now())
  const [error, setError] = useState<string | null>(null)
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null)

  // Inicializar valores de input apenas uma vez após o componente ser montado
  useEffect(() => {
    if (!isInitialized && question.componentType === "text") {
      const initialValues = question.inputs.reduce((acc: { [key: string]: string }, input) => {
        acc[input.id] = ""
        return acc
      }, {})

      // Se houver uma resposta existente, analisá-la e definir os valores de entrada
      if (answer && typeof answer === "string") {
        try {
          const parsedAnswer = JSON.parse(answer)
          Object.assign(initialValues, parsedAnswer)
        } catch (e) {
          console.error("Erro ao analisar resposta:", e)
        }
      }

      setInputValues(initialValues)
      setIsInitialized(true)
    }
  }, [question.componentType, question.inputs, answer, isInitialized])

  // Função para validar um email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Função para validar um campo com máscara
  const validateMaskedField = (value: string, mask: string): boolean => {
    if (!value) return false
    
    // Para telefone, verificar se tem o número correto de dígitos
    if (mask === "(99) 9999-9999") {
      return value.replace(/\D/g, "").length === 10
    }
    
    if (mask === "(99) 99999-9999") {
      return value.replace(/\D/g, "").length === 11
    }
    
    // Para data, verificar se tem o formato correto
    if (mask === "99/99/9999") {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      if (!dateRegex.test(value)) return false
      
      // Verificar se a data é válida
      const [day, month, year] = value.split('/').map(Number)
      const date = new Date(year, month - 1, day)
      return date.getDate() === day && 
             date.getMonth() === month - 1 && 
             date.getFullYear() === year
    }
    
    return true
  }

  // Função para validar todos os inputs
  const validateInputs = (): { isValid: boolean; errorMessage: string | null } => {
    // Se não for um componente de texto, não há validação específica
    if (question.componentType !== "text") {
      return { isValid: true, errorMessage: null }
    }
    
    // Verificar cada input
    for (const input of question.inputs) {
      const value = inputValues[input.id] || ""
      
      // Verificar se o campo é obrigatório e está vazio
      if (input.required && !value.trim()) {
        return { 
          isValid: false, 
          errorMessage: `O campo ${input.label || 'Campo'} é obrigatório.` 
        }
      }
      
      // Se o campo não está vazio, verificar o tipo
      if (value.trim()) {
        // Validar email
        if (input.type === "email" && !validateEmail(value)) {
          return { 
            isValid: false, 
            errorMessage: `O campo ${input.label || 'Email'} deve conter um email válido.` 
          }
        }
        
        // Validar campos com máscara
        if (input.mask && !validateMaskedField(value, input.mask)) {
          return { 
            isValid: false, 
            errorMessage: `O campo ${input.label || 'Campo'} deve estar no formato correto.` 
          }
        }
      }
    }
    
    return { isValid: true, errorMessage: null }
  }

  // Efeito para validar os inputs e atualizar o erro
  useEffect(() => {
    if (isInitialized && question.componentType === "text") {
      const { isValid, errorMessage } = validateInputs()
      setError(errorMessage)
      
      // Propagar o erro para o componente pai, se necessário
      if (onValidationError) {
        onValidationError(errorMessage)
      }
    }
  }, [inputValues, isInitialized, question.componentType, question.inputs, onValidationError])

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
                className={`py-2 px-4 text-white ${question.config.ctaFullWidth ? "w-full" : ""}`}
                style={{
                  backgroundColor: previewThemeColor,
                  borderRadius: question.config.ctaRounded ? "9999px" : "0.375rem",
                }}
              >
                {question.config.ctaFullWidth ? "" : "flex justify-center"}
              
                <Button
                  className={`py-2 px-4 text-white border border-white ${question.config.ctaFullWidth ? "w-full" : ""}`}
                  style={{
                    backgroundColor: "transparent",
                    borderRadius: question.config.ctaRounded ? "9999px" : "0.375rem",
                  }}
                >
                  {question.config.imageCta?.text || "Saiba mais"}
                </Button>
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
                placeholder="Adicione um comentário sobre a imagem..."ntário sobre a imagem..."
                className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none"\
              />
            </div>
          )
        }
        return null
      default:
        return null
    }
  }

  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: value }))

    // Atualizar a resposta para o componente pai
    const updatedValues = { ...inputValues, [id]: value }
    onAnswer(JSON.stringify(updatedValues))
  }

  // Função para aplicar máscara manualmente sem depender de bibliotecas externas
  const applyMask = (value: string, mask: string) => {
    let maskedValue = ""
    let valueIndex = 0

    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      const maskChar = mask[i]

      if (maskChar === "9") {
        // Se o caractere da máscara é 9, aceita apenas dígitos
        if (/\d/.test(value[valueIndex])) {
          maskedValue += value[valueIndex]
          valueIndex++
        } else {
          // Se não for dígito, avança para o próximo caractere do valor
          valueIndex++
          i-- // Mantém o mesmo caractere da máscara
        }
      } else {
        // Se for outro caractere da máscara, adiciona-o diretamente
        maskedValue += maskChar

        // Se o caractere do valor for igual ao da máscara, avança no valor
        if (value[valueIndex] === maskChar) {
          valueIndex++
        }
      }
    }

    return maskedValue
  }

  // Função para lidar com a mudança de valor em campos com máscara
  const handleMaskedInputChange = (id: string, value: string, mask: string) => {
    // Remove caracteres não numéricos para processar
    const numericValue = value.replace(/\D/g, "")

    // Aplica a máscara
    const maskedValue = applyMask(numericValue, mask)

    // Atualiza o estado
    setInputValues((prev) => ({ ...prev, [id]: maskedValue }))

    // Atualiza a resposta para o componente pai
    const updatedValues = { ...inputValues, [id]: maskedValue }
    onAnswer(JSON.stringify(updatedValues))
  }

  // Função para determinar o placeholder com base no tipo/máscara
  const getPlaceholder = (input: any) => {
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
                  borderRadius: question.config.ctaRounded ? "9999px" : "0.375rem",
                }}
              >
                {question.config.
