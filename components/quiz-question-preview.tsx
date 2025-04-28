"use client"

import { useState, useEffect } from "react"
import type { Question } from "@/lib/store"

interface QuizQuestionPreviewProps {
  question: Question
  viewMode: "desktop" | "mobile"
  themeColor?: string
  buttonRounded?: boolean
  buttonStyle?: "primary" | "secondary"
  isPreview?: boolean
}

export default function QuizQuestionPreview({
  question,
  viewMode,
  themeColor = "#ff9811",
  buttonRounded = false,
  buttonStyle = "primary",
  isPreview = false,
}: QuizQuestionPreviewProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resetar estados quando a questão muda
  useEffect(() => {
    setInputValues({})
    setSelectedOptions([])
    setTouchedFields({})
    setErrors({})
  }, [question.id])

  // Função para obter o placeholder com base no tipo ou máscara
  const getPlaceholder = (input: any) => {
    if (input.type === "email") {
      return "email@exemplo.com"
    } else if (input.mask === "(99) 9999-9999" || input.mask === "(99) 99999-9999") {
      return "(00) 00000-0000"
    } else if (input.mask === "99/99/9999") {
      return "dd/mm/aaaa"
    } else if (input.type === "number") {
      return "Digite um número"
    }
    return input.placeholder || "Insira sua resposta aqui"
  }

  // Função para obter a mensagem de ajuda com base no tipo ou máscara
  const getHelpMessage = (input: any) => {
    if (input.type === "email") {
      return "Digite um email válido"
    } else if (input.mask === "(99) 9999-9999" || input.mask === "(99) 99999-9999") {
      return "Digite um telefone válido"
    } else if (input.mask === "99/99/9999") {
      return "Digite uma data válida (dd/mm/aaaa)"
    }
    return ""
  }

  // Função para validar um campo
  const validateField = (input: any, value: string) => {
    if (input.required && !value.trim()) {
      return "Este campo é obrigatório"
    }

    if (input.type === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return "Digite um email válido"
      }
    }

    return ""
  }

  // Função para lidar com a mudança de valor nos inputs
  const handleInputChange = (inputId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [inputId]: value }))

    // Marcar o campo como tocado
    if (!touchedFields[inputId]) {
      setTouchedFields((prev) => ({ ...prev, [inputId]: true }))
    }

    // Validar apenas se o campo já foi tocado
    const input = question.inputs.find((i) => i.id === inputId)
    if (input && touchedFields[inputId]) {
      const error = validateField(input, value)
      setErrors((prev) => ({ ...prev, [inputId]: error }))
    }
  }

  // Função para lidar com a seleção de opções
  const handleOptionSelect = (optionId: string) => {
    if (question.config.multipleSelection) {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  // Função para renderizar o componente de texto
  const renderTextComponent = () => {
    return (
      <div className="flex flex-col">
        {question.config.showTitles && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
            {question.subtitle && <p className="text-[#667085]">{question.subtitle}</p>}
          </div>
        )}

        <div className="space-y-4">
          {question.inputs.map((input) => (
            <div key={input.id} className="flex flex-col">
              {input.label && <label className="mb-1 text-sm font-medium">{input.label}</label>}
              <div className="relative">
                <input
                  type={input.type}
                  placeholder={getPlaceholder(input)}
                  value={inputValues[input.id] || ""}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  onBlur={() => setTouchedFields((prev) => ({ ...prev, [input.id]: true }))}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields[input.id] && errors[input.id] ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isPreview}
                />
              </div>
              {touchedFields[input.id] && errors[input.id] && (
                <p className="mt-1 text-sm text-red-500">{errors[input.id]}</p>
              )}
              {getHelpMessage(input) && <p className="mt-1 text-xs text-[#667085]">{getHelpMessage(input)}</p>}
            </div>
          ))}
        </div>

        {question.config.showButton && (
          <div className={`mt-6 ${question.config.centerContent ? "text-center" : ""}`}>
            <button
              className={`px-4 py-2 ${
                buttonStyle === "primary"
                  ? "bg-[var(--theme-color)] text-white"
                  : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
              } ${buttonRounded ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
              disabled={isPreview}
            >
              {question.config.buttonText || "Continuar"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Função para renderizar o componente de múltipla escolha
  const renderMultipleChoiceComponent = () => {
    return (
      <div className="flex flex-col">
        {question.config.showTitles && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
            {question.subtitle && <p className="text-[#667085]">{question.subtitle}</p>}
          </div>
        )}

        <div className="space-y-2">
          {question.options?.map((option) => (
            <div
              key={option.id}
              className={`p-3 border rounded-md cursor-pointer ${
                selectedOptions.includes(option.id)
                  ? `bg-[${themeColor}]/10 border-[${themeColor}]`
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{
                backgroundColor: selectedOptions.includes(option.id) ? `${themeColor}10` : "",
                borderColor: selectedOptions.includes(option.id) ? themeColor : "",
              }}
              onClick={() => !isPreview && handleOptionSelect(option.id)}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    selectedOptions.includes(option.id)
                      ? `border-[${themeColor}] bg-[${themeColor}]`
                      : "border-gray-300"
                  }`}
                  style={{
                    borderColor: selectedOptions.includes(option.id) ? themeColor : "",
                    backgroundColor: selectedOptions.includes(option.id) ? themeColor : "",
                  }}
                >
                  {selectedOptions.includes(option.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span>{option.text}</span>
              </div>
            </div>
          ))}
        </div>

        {question.config.showButton && (
          <div className={`mt-6 ${question.config.centerContent ? "text-center" : ""}`}>
            <button
              className={`px-4 py-2 ${
                buttonStyle === "primary"
                  ? "bg-[var(--theme-color)] text-white"
                  : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
              } ${buttonRounded ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
              disabled={isPreview}
            >
              {question.config.buttonText || "Continuar"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Função para renderizar o componente de imagem
  const renderImageComponent = () => {
    // Ordenar os elementos conforme a ordem definida
    const sortedElements = [...(question.imageElements || [])]

    return (
      <div className="flex flex-col h-full">
        {sortedElements.map((element) => {
          if (element.type === "image" && question.imageUrl) {
            return (
              <div key={element.id} className="mb-4">
                <img
                  src={question.imageUrl || "/placeholder.svg"}
                  alt="Imagem da questão"
                  className="w-full h-auto rounded-md object-cover"
                />
              </div>
            )
          } else if (element.type === "title" && question.config.showTitles) {
            return (
              <div key={element.id} className="mb-4 text-center">
                <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
                {question.subtitle && <p className="text-[#667085]">{question.subtitle}</p>}
              </div>
            )
          } else if (element.type === "cta" && question.config.showImageCta) {
            return (
              <div key={element.id} className={`mb-4 ${question.config.centerContent ? "text-center" : ""}`}>
                <button
                  className={`${question.config.ctaFullWidth ? "w-full" : "px-6"} py-2 ${
                    buttonStyle === "primary"
                      ? "bg-[var(--theme-color)] text-white"
                      : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
                  } ${question.config.ctaRounded || buttonRounded ? "rounded-full" : "rounded-md"}`}
                  style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
                  disabled={isPreview}
                >
                  {question.config.imageCta?.text || "Clique aqui"}
                </button>
              </div>
            )
          } else if (element.type === "input" && question.config.showImageInput) {
            return (
              <div key={element.id} className="space-y-4 mb-4">
                {question.inputs.map((input) => (
                  <div key={input.id} className="flex flex-col">
                    {input.label && <label className="mb-1 text-sm font-medium">{input.label}</label>}
                    <div className="relative">
                      <input
                        type={input.type}
                        placeholder={getPlaceholder(input)}
                        value={inputValues[input.id] || ""}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        onBlur={() => setTouchedFields((prev) => ({ ...prev, [input.id]: true }))}
                        className={`w-full p-2 border rounded-md ${
                          touchedFields[input.id] && errors[input.id] ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={isPreview}
                      />
                    </div>
                    {touchedFields[input.id] && errors[input.id] && (
                      <p className="mt-1 text-sm text-red-500">{errors[input.id]}</p>
                    )}
                    {getHelpMessage(input) && <p className="mt-1 text-xs text-[#667085]">{getHelpMessage(input)}</p>}
                  </div>
                ))}
              </div>
            )
          }
          return null
        })}

        {question.config.showButton && (
          <div className={`mt-auto ${question.config.centerContent ? "text-center" : ""}`}>
            <button
              className={`px-4 py-2 ${
                buttonStyle === "primary"
                  ? "bg-[var(--theme-color)] text-white"
                  : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
              } ${buttonRounded ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
              disabled={isPreview}
            >
              {question.config.buttonText || "Continuar"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Função para renderizar o componente de vídeo
  const renderVideoComponent = () => {
    return (
      <div className="flex flex-col">
        {question.config.showTitles && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
            {question.subtitle && <p className="text-[#667085]">{question.subtitle}</p>}
          </div>
        )}

        {question.youtubeUrl && (
          <div className="mb-4">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-md">
              <iframe
                src={question.youtubeUrl.replace("watch?v=", "embed/")}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {!question.config.hideDescription && question.videoDescription && (
          <div className={`mb-4 ${question.config.centerDescription ? "text-center" : ""}`}>
            <p className="text-[#667085]">{question.videoDescription}</p>
          </div>
        )}

        {question.config.showButton && (
          <div className={`mt-6 ${question.config.centerContent ? "text-center" : ""}`}>
            <button
              className={`px-4 py-2 ${
                buttonStyle === "primary"
                  ? "bg-[var(--theme-color)] text-white"
                  : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
              } ${buttonRounded ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
              disabled={isPreview}
            >
              {question.config.buttonText || "Continuar"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Função para renderizar o componente de texto longo
  const renderLongTextComponent = () => {
    return (
      <div className="flex flex-col">
        {question.config.showTitles && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
            {question.subtitle && <p className="text-[#667085]">{question.subtitle}</p>}
          </div>
        )}

        <div className="mb-4">
          <textarea
            value={question.longTextValue || ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
          ></textarea>
        </div>

        {question.config.showButton && (
          <div className={`mt-6 ${question.config.centerContent ? "text-center" : ""}`}>
            <button
              className={`px-4 py-2 ${
                buttonStyle === "primary"
                  ? "bg-[var(--theme-color)] text-white"
                  : "bg-white text-[var(--theme-color)] border border-[var(--theme-color)]"
              } ${buttonRounded ? "rounded-full" : "rounded-md"}`}
              style={{ backgroundColor: buttonStyle === "primary" ? themeColor : "white" }}
              disabled={isPreview}
            >
              {question.config.buttonText || "Continuar"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Renderizar o componente apropriado com base no tipo
  const renderComponent = () => {
    switch (question.componentType) {
      case "text":
        return renderTextComponent()
      case "multiple-choice":
        return renderMultipleChoiceComponent()
      case "image":
        return renderImageComponent()
      case "video":
        return renderVideoComponent()
      case "long-text":
        return renderLongTextComponent()
      default:
        return <div>Tipo de componente não suportado</div>
    }
  }

  return <div className="p-4 h-full flex flex-col">{renderComponent()}</div>
}
