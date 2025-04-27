"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { Question } from "@/lib/store"

interface QuizQuestionPublicProps {
  question: Question
  answer: string | string[] | null
  onAnswer: (value: string | string[]) => void
  previewThemeColor: string
  buttonRounded: boolean
  buttonStyle: "primary" | "secondary"
  onValidationError?: (error: string | null) => void
}

export default function QuizQuestionPublic({
  question,
  answer,
  onAnswer,
  previewThemeColor,
  buttonRounded,
  buttonStyle,
  onValidationError,
}: QuizQuestionPublicProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null)
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string>("")
  const [hasYoutubeUrl, setHasYoutubeUrl] = useState(!!question.youtubeUrl)
  // Rastrear quais campos foram tocados pelo usuário
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({})

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

    // Marca o campo como tocado
    setTouchedFields((prev) => ({ ...prev, [id]: true }))

    // Atualiza a resposta para o componente pai
    const updatedValues = { ...inputValues, [id]: maskedValue }
    onAnswer(JSON.stringify(updatedValues))
  }

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
      const [day, month, year] = value.split("/").map(Number)
      const date = new Date(year, month - 1, day)
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year
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
      const isTouched = touchedFields[input.id]

      // Só validar campos que foram tocados pelo usuário
      if (!isTouched) continue

      // Verificar se o campo é obrigatório e está vazio
      if (input.required && !value.trim()) {
        return {
          isValid: false,
          errorMessage: `O campo ${input.label || "Campo"} é obrigatório.`,
        }
      }

      // Se o campo não está vazio, verificar o tipo
      if (value.trim()) {
        // Validar email
        if (input.type === "email" && !validateEmail(value)) {
          return {
            isValid: false,
            errorMessage: `O campo ${input.label || "Email"} deve conter um email válido.`,
          }
        }

        // Validar campos com máscara
        if (input.mask && !validateMaskedField(value, input.mask)) {
          return {
            isValid: false,
            errorMessage: `O campo ${input.label || "Campo"} deve estar no formato correto.`,
          }
        }
      }
    }

    return { isValid: true, errorMessage: null }
  }

  // Efeito para validar os inputs e atualizar o erro
  useEffect(() => {
    const shouldValidate = isInitialized && question.componentType === "text"
    let errorMessage = null

    if (shouldValidate) {
      const validationResult = validateInputs()
      errorMessage = validationResult.errorMessage
      setError(errorMessage)
    } else {
      setError(null)
    }

    // Propagar o erro para o componente pai, se necessário
    if (onValidationError) {
      onValidationError(errorMessage)
    }
  }, [inputValues, touchedFields, isInitialized, question.componentType, question.inputs, onValidationError])

  const [internalHasYoutubeUrl, setInternalHasYoutubeUrl] = useState(!!question.youtubeUrl)
  const [hasCheckedYoutubeUrl, setHasCheckedYoutubeUrl] = useState(false)
  const [youtubeEmbedUrlMemo, setYoutubeEmbedUrlMemo] = useState<string>("")

  useEffect(() => {
    setInternalHasYoutubeUrl(!!question.youtubeUrl)
  }, [question.youtubeUrl])

  useEffect(() => {
    if (!hasCheckedYoutubeUrl) {
      const processYoutubeUrl = () => {
        if (internalHasYoutubeUrl) {
          // Verificar se é um YouTube Short
          const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/
          const shortsMatch = question.youtubeUrl?.match(shortsRegExp)

          if (shortsMatch && shortsMatch[2].length === 11) {
            const embedUrl = `https://www.youtube.com/embed/${shortsMatch[2]}`
            setYoutubeEmbedUrlMemo(embedUrl)
            setYoutubeEmbedUrl(embedUrl)
            return true
          }

          // Padrões de URL do YouTube padrão
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
          const match = question.youtubeUrl?.match(regExp)

          if (match && match[2].length === 11) {
            const embedUrl = `https://www.youtube.com/embed/${match[2]}`
            setYoutubeEmbedUrlMemo(embedUrl)
            setYoutubeEmbedUrl(embedUrl)
            return true
          }

          setYoutubeEmbedUrl("") // Define como vazio se não corresponder a nenhum padrão
          setYoutubeEmbedUrlMemo("")
          return true
        } else {
          setYoutubeEmbedUrl("") // Define como vazio se não houver URL do YouTube
          setYoutubeEmbedUrlMemo("")
          return true
        }
      }

      const finishedProcessing = processYoutubeUrl()
      setHasCheckedYoutubeUrl(finishedProcessing)
    }
  }, [internalHasYoutubeUrl, question.youtubeUrl, hasCheckedYoutubeUrl])

  // Tratamento de erro para renderização segura
  try {
    // Verificar se o título e subtítulo foram editados pelo usuário
    const defaultTitle = "Escreva aqui o título da sua questão"
    const defaultSubtitle = "Subtítulo da questão (opcional)"

    // Verificar se os valores são os padrões
    const isTitleDefault = question.title === defaultTitle
    const isSubtitleDefault = question.subtitle === defaultSubtitle || !question.subtitle

    // Check if we're showing an image in full mode
    const isFullImageMode = useMemo(
      () => question.componentType === "image" && question.imageUrl && question.config.imagePosition === "full",
      [question.componentType, question.imageUrl, question.config.imagePosition],
    )

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

    // Modificar a função renderIcon para preservar a proporção da imagem
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
                {!isTitleDefault && <h3 className="text-xl font-semibold">{question.title}</h3>}
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
                  className={`py-2 px-4 text-white ${question.config.ctaFullWidth ? "" : ""} ${
                    buttonStyle === "secondary" ? "bg-transparent border" : ""
                  }`}
                  style={{
                    backgroundColor: buttonStyle === "primary" ? previewThemeColor : "transparent",
                    borderRadius: question.config.ctaRounded ? "9999px" : "0.375rem",
                    color: buttonStyle === "primary" ? "white" : previewThemeColor,
                    borderColor: buttonStyle === "secondary" ? previewThemeColor : undefined,
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

    const handleInputChange = (id: string, value: string) => {
      setInputValues((prev) => ({ ...prev, [id]: value }))

      // Marca o campo como tocado
      setTouchedFields((prev) => ({ ...prev, [id]: true }))

      // Atualizar a resposta para o componente pai
      const updatedValues = { ...inputValues, [id]: value }
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

    // Renderização condicional para diferentes tipos de componentes
    if (isFullImageMode) {
      return (
        <div className="h-full flex flex-col relative">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={question.imageUrl || "/placeholder.svg"}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Content on top of the image */}
          <div className="relative z-10 flex flex-col h-full text-white p-4">
            <div className="flex-shrink-0">
              {question.config.showTitles && (
                <>
                  {!isTitleDefault && (
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
                  )}
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

    // Retorno normal do componente
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0">
          {question.config.showTitles && question.componentType !== "image" && (
            <>
              {!isTitleDefault && (
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
              )}
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
          {renderIcon(question)}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {question.componentType === "multiple-choice" && (
            <div className="space-y-2">
              {(question.options || []).map((option, index) => {
                const isSelected = Array.isArray(answer) && answer.includes(option.id)

                return (
                  <div
                    key={option.id}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected ? "border-[var(--theme-color)] border-2" : "border-[#e6e6e6] hover:border-[#d0d5dd]"
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
                          src={youtubeEmbedUrlMemo}
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
                          src={youtubeEmbedUrlMemo}
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
            <div className="space-y-4">
              {question.inputs.map((input, index) => {
                // Verificar explicitamente o tipo do input
                const inputType = input.type || "text"
                const placeholder = input.placeholder || getPlaceholder(input)
                const isFocused = focusedInputId === input.id
                const value = inputValues[input.id] || ""
                const isTouched = touchedFields[input.id]

                // Determinar qual máscara aplicar
                const hasMask = !!input.mask && input.mask.length > 0

                // Verificar se o campo tem erro - apenas se foi tocado
                const hasError =
                  isTouched &&
                  ((input.required && !value.trim()) ||
                    (inputType === "email" && value.trim() && !validateEmail(value)) ||
                    (hasMask && value.trim() && !validateMaskedField(value, input.mask)))

                return (
                  <div key={input.id} className="mb-4">
                    {input.label && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    <div className="relative">
                      {hasMask ? (
                        // Campo com máscara
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleMaskedInputChange(input.id, e.target.value, input.mask || "")}
                          onFocus={() => setFocusedInputId(input.id)}
                          onBlur={() => {
                            setFocusedInputId(null)
                            // Marcar como tocado ao perder o foco
                            setTouchedFields((prev) => ({ ...prev, [input.id]: true }))
                          }}
                          placeholder={placeholder}
                          readOnly={false}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none ${
                            hasError
                              ? "border-red-500"
                              : isFocused
                                ? "border-2 border-[var(--theme-color)] ring-1 ring-[var(--theme-color)]"
                                : "border-gray-300"
                          }`}
                        />
                      ) : (
                        // Campo sem máscara (texto, email, número)
                        <input
                          type={inputType}
                          value={value}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          onFocus={() => setFocusedInputId(input.id)}
                          onBlur={() => {
                            setFocusedInputId(null)
                            // Marcar como tocado ao perder o foco
                            setTouchedFields((prev) => ({ ...prev, [input.id]: true }))
                          }}
                          placeholder={placeholder}
                          readOnly={false}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none ${
                            hasError
                              ? "border-red-500"
                              : isFocused
                                ? "border-2 border-[var(--theme-color)] ring-1 ring-[var(--theme-color)]"
                                : "border-gray-300"
                          }`}
                        />
                      )}
                      {input.required && <span className="absolute top-0 right-0 text-red-500 mr-2 mt-2">*</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {inputType === "email" && "Formato de email válido: exemplo@dominio.com"}
                      {hasMask && `Formato esperado: ${input.mask}`}
                    </div>
                    {hasError && (
                      <div className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {input.required && !value.trim()
                          ? "Este campo é obrigatório"
                          : inputType === "email" && !validateEmail(value)
                            ? "Email inválido"
                            : "Formato inválido"}
                      </div>
                    )}
                  </div>
                )
              })}
              {question.inputs.length === 0 && (
                <div className="border border-[#d0d5dd] rounded-md p-3 overflow-hidden">
                  <input
                    type="text"
                    value={(answer as string) || ""}
                    placeholder="Insira sua resposta aqui"
                    className="w-full outline-none"
                    onChange={(e) => onAnswer(e.target.value)}
                  />
                </div>
              )}
              {error && (
                <div className="mt-2 text-red-500 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
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
                className="w-full border border-[#d0d5dd] rounded-md p-3 min-h-[100px] resize-none focus:outline-none focus:border-2 focus:border-[var(--theme-color)] focus:ring-1 focus:ring-[var(--theme-color)]"
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

          {question.componentType === "final-screen" && (
            <div className="h-full flex flex-col">
              {/* Imagem */}
              {question.config.showImage !== false && (
                <div className="w-full mb-6">
                  {question.imageUrl ? (
                    <img
                      src={question.imageUrl || "/placeholder.svg"}
                      alt="Background"
                      className="w-full h-[200px] object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full bg-purple-600 flex items-center justify-center rounded-md h-[200px]">
                      <p className="text-white text-lg">Adicione uma imagem aqui</p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Button */}
              {question.config.showFinalCta && (
                <div className="mt-auto w-full">
                  <a
                    href={question.config.finalCtaLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full"
                  >
                    <Button
                      className={`w-full py-4 ${question.config.finalCtaFullWidth ? "w-full" : ""} ${
                        buttonStyle === "secondary" ? "bg-transparent border" : ""
                      }`}
                      style={{
                        backgroundColor: buttonStyle === "primary" ? previewThemeColor : "transparent",
                        color: buttonStyle === "primary" ? "white" : previewThemeColor,
                        borderColor: buttonStyle === "secondary" ? previewThemeColor : undefined,
                        borderRadius: buttonRounded ? "9999px" : "0.375rem",
                      }}
                    >
                      {question.config.finalCtaText || "Visite nosso site"}
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } catch (err) {
    console.error("Erro ao renderizar questão:", err)
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-500">Erro ao renderizar esta questão. Por favor, tente novamente.</p>
      </div>
    )
  }
}
