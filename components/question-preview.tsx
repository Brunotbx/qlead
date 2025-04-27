"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useDrop, useDrag } from "react-dnd"
import { User, Phone, AtSign, PlusCircle, Trash2, GripVertical, ArrowRight, Pencil } from "lucide-react"
import { type Question, useQuizStore, type ImageElement } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageIcon, VideoIcon } from "./components-list"
import { Textarea } from "@/components/ui/textarea"

// Update the main QuestionPreview component to handle full image mode
export default function QuestionPreview({
  question,
  viewMode,
}: {
  question: Question
  viewMode: "desktop" | "mobile"
}) {
  const { updateQuestion, addInputToQuestion, removeInputFromQuestion, reorderInputs } = useQuizStore()
  const { questions, customLogo } = useQuizStore()
  const currentIndex = questions.findIndex((q) => q.id === question.id)
  const { previewThemeColor, buttonRounded, buttonStyle } = useQuizStore()
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isSubtitleFocused, setIsSubtitleFocused] = useState(false)
  const [buttonActive, setButtonActive] = useState(true)
  const [startTime, setStartTime] = useState(Date.now())

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: () => ({ dropped: true }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  useEffect(() => {
    // Se a questão tem um timer configurado e é maior que 0
    if (question.config.buttonTimer && question.config.buttonTimer > 0) {
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
      }, question.config.buttonTimer * 1000)

      // Limpar o timer e o intervalo quando o componente for desmontado
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      // Se não há timer ou é 0, o botão sempre está ativo
      setButtonActive(true)
    }
  }, [question.id, question.config.buttonTimer])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se o valor atual for o placeholder padrão, limpe-o no primeiro foco
    if (e.target.value === "Escreva aqui o título da sua questão") {
      updateQuestion(question.id, { title: "" })
    } else {
      updateQuestion(question.id, { title: e.target.value })
    }
  }

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se o valor atual for o placeholder padrão, limpe-o no primeiro foco
    if (e.target.value === "Subtítulo da questão (opcional)") {
      updateQuestion(question.id, { subtitle: "" })
    } else {
      updateQuestion(question.id, { subtitle: e.target.value })
    }
  }

  const handleAddInput = (type: "text" | "email" | "phone") => {
    addInputToQuestion(question.id, type)
  }

  const handleRemoveInput = (inputId: string) => {
    removeInputFromQuestion(question.id, inputId)
  }

  // Verificar se o subtítulo está vazio ou é o padrão
  const isSubtitleEmpty = !question.subtitle || question.subtitle === "Subtítulo da questão (opcional)"

  // Renderizar o ícone com base na posição configurada
  const renderIcon = () => {
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

  // Check if we're showing an image in full mode
  const isFullImageMode =
    question.componentType === "image" && question.imageUrl && question.config.imagePosition === "full"

  // Renderizar o título e subtítulo apenas se não for um componente de imagem
  // ou se for um componente de imagem sem imageElements (para compatibilidade)
  const shouldRenderTitleOutside = question.componentType !== "image" || !question.imageElements

  // Add functions to handle title/subtitle deletion
  const handleDeleteTitle = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuestion(question.id, { title: "" })
  }

  const handleDeleteSubtitle = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuestion(question.id, { subtitle: "" })
  }

  return (
    <div
      ref={drop}
      className={`${
        viewMode === "mobile"
          ? "p-0 flex flex-col h-[667px]" // Increased height to simulate mobile phone better
          : "max-w-[500px] mx-auto flex flex-col" // Changed from max-w-3xl to max-w-[500px]
      } ${isOver && canDrop ? "bg-[#f9fafb] border-2 border-dashed border-[var(--theme-color)] rounded-lg p-4" : ""}`}
    >
      {isFullImageMode ? (
        // Full image mode layout
        <>
          <div className="relative w-full h-full flex flex-col">
            {/* Background image covering everything */}
            <div className="absolute inset-0 z-0">
              <img
                src={question.imageUrl || "/placeholder.svg"}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Content on top of the image */}
            <div className="relative z-10 flex flex-col h-full text-white">
              {/* Progress Bar with Logo - Always at the top */}
              <div className={`${viewMode === "mobile" ? "p-4 px-8" : ""} mb-6 flex-shrink-0`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {customLogo ? (
                      <img src={customLogo || "/placeholder.svg"} alt="Logo personalizado" className="max-h-8" />
                    ) : (
                      <div className="font-bold text-lg">
                        <span className="text-white">quiz</span>
                        <span style={{ color: "white" }}>lead</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-white">
                    {currentIndex + 1} de {questions.length}
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: "white", width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className={`flex-1 overflow-y-auto ${viewMode === "mobile" ? "px-8" : ""}`}>
                {/* Ícone com posição configurável */}
                {renderIcon()}

                <div className="mb-8">
                  {question.config.showTitles && (
                    <>
                      <div className="relative group mb-4">
                        <div className={`relative ${isTitleFocused ? "border border-white rounded-md" : ""}`}>
                          <input
                            value={question.title}
                            onChange={handleTitleChange}
                            onFocus={(e) => {
                              setIsTitleFocused(true)
                              if (e.target.value === "Escreva aqui o título da sua questão") {
                                updateQuestion(question.id, { title: "" })
                              }
                            }}
                            className="text-2xl font-semibold text-white w-full p-2 outline-none bg-transparent"
                            placeholder="Escreva aqui o título da sua questão"
                            onBlur={() => setIsTitleFocused(false)}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y/1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="relative group">
                        <div className={`relative ${isSubtitleFocused ? "border border-white rounded-md" : ""}`}>
                          <input
                            value={question.subtitle || ""}
                            onChange={handleSubtitleChange}
                            onFocus={(e) => {
                              setIsSubtitleFocused(true)
                              if (e.target.value === "Subtítulo da questão (opcional)") {
                                updateQuestion(question.id, { subtitle: "" })
                              }
                            }}
                            className="text-white w-full p-2 outline-none bg-transparent"
                            placeholder="Subtítulo da questão (opcional)"
                            onBlur={() => setIsSubtitleFocused(false)}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y/1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA button if enabled */}
                {question.config.showImageCta && (
                  <div className={`mt-4 mb-4 ${question.config.ctaFullWidth ? "" : "flex justify-center"}`}>
                    <Button
                      className={`py-2 px-4 text-white border border-white ${
                        question.config.ctaFullWidth ? "w-full" : ""
                      }`}
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
                  <div className="mt-4">
                    <textarea
                      placeholder="Adicione um comentário sobre a imagem..."
                      className="w-full border border-white/30 rounded-md p-3 min-h-[100px] resize-none bg-transparent text-white placeholder:text-white/70"
                    />
                  </div>
                )}
              </div>

              {/* Button - Always at the bottom */}
              {question.config.showButton && (
                <div className={`${viewMode === "mobile" ? "p-4 px-8" : ""} mt-auto flex-shrink-0`}>
                  <Button
                    className="w-full py-6 text-white flex items-center justify-center gap-2 border border-white"
                    style={{
                      backgroundColor: "transparent",
                      borderRadius: question.config.buttonRounded ? "9999px" : "0.375rem",
                      opacity: buttonActive ? 1 : 0.5,
                    }}
                    disabled={!buttonActive}
                  >
                    {!buttonActive && question.config.buttonTimer
                      ? `Aguarde ${Math.ceil((question.config.buttonTimer * 1000 - (Date.now() - startTime)) / 1000)}s...`
                      : question.config.buttonText || "Continuar"}
                    {buttonActive && question.config.buttonShowIcon && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Regular layout
        <>
          {/* Progress Bar with Logo - Always at the top */}
          <div className={`${viewMode === "mobile" ? "p-4 px-8" : ""} mb-6 flex-shrink-0`}>
            <div className="flex justify-between items-center mb-1">
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
          <div className={`flex-1 overflow-y-auto ${viewMode === "mobile" ? "px-8" : ""}`}>
            {/* Ícone com posição configurável */}
            {renderIcon()}

            {/* Renderizar título e subtítulo fora do componente de imagem */}
            {shouldRenderTitleOutside && question.config.showTitles && (
              <div className="mb-8">
                <div className="relative group mb-4">
                  <div className={`relative ${isTitleFocused ? "border border-[var(--theme-color)] rounded-md" : ""}`}>
                    <input
                      value={question.title}
                      onChange={handleTitleChange}
                      onFocus={(e) => {
                        setIsTitleFocused(true)
                        if (e.target.value === "Escreva aqui o título da sua questão") {
                          updateQuestion(question.id, { title: "" })
                        }
                      }}
                      className="text-2xl font-semibold text-[#101828] w-full p-2 outline-none bg-transparent"
                      placeholder="Escreva aqui o título da sua questão"
                      onBlur={() => setIsTitleFocused(false)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y/1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Pencil className="w-4 h-4 text-[#667085] cursor-pointer" />
                      <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={handleDeleteTitle} />
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <div
                    className={`relative ${isSubtitleFocused ? "border border-[var(--theme-color)] rounded-md" : ""}`}
                  >
                    <input
                      value={question.subtitle || ""}
                      onChange={handleSubtitleChange}
                      onFocus={(e) => {
                        setIsSubtitleFocused(true)
                        if (e.target.value === "Subtítulo da questão (opcional)") {
                          updateQuestion(question.id, { subtitle: "" })
                        }
                      }}
                      className="text-[#667085] w-full p-2 outline-none bg-transparent"
                      placeholder="Subtítulo da questão (opcional)"
                      onBlur={() => setIsSubtitleFocused(false)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y/1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Pencil className="w-4 h-4 text-[#667085] cursor-pointer" />
                      <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={handleDeleteSubtitle} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              {question.componentType === "multiple-choice" && <MultipleChoiceComponent question={question} />}

              {question.componentType === "image" && (
                <ImageComponent
                  question={question}
                  onTitleChange={handleTitleChange}
                  onSubtitleChange={handleSubtitleChange}
                  isTitleFocused={isTitleFocused}
                  isSubtitleFocused={isSubtitleFocused}
                  setIsTitleFocused={setIsTitleFocused}
                  setIsSubtitleFocused={setIsSubtitleFocused}
                />
              )}

              {question.componentType === "video" && <VideoComponent question={question} viewMode={viewMode} />}

              {question.componentType === "text" && (
                <TextComponent
                  question={question}
                  onAddInput={handleAddInput}
                  onRemoveInput={handleRemoveInput}
                  onReorderInputs={reorderInputs}
                />
              )}

              {question.componentType === "long-text" && <LongTextComponent question={question} />}
            </div>
          </div>

          {/* Button - Always at the bottom */}
          {question.config.showButton && (
            <div className={`${viewMode === "mobile" ? "p-4 px-8" : ""} mt-auto flex-shrink-0`}>
              {question.config.buttonRedirect && question.config.buttonLink ? (
                <a href={question.config.buttonLink} target="_blank" rel="noopener noreferrer" className="block w-full">
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
                    {!buttonActive && question.config.buttonTimer
                      ? `Aguarde ${Math.ceil((question.config.buttonTimer * 1000 - (Date.now() - startTime)) / 1000)}s...`
                      : question.config.buttonText || "Continuar"}
                    {buttonActive && question.config.buttonShowIcon && <ArrowRight className="w-4 h-4" />}
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
                  disabled={!buttonActive}
                >
                  {!buttonActive && question.config.buttonTimer
                    ? `Aguarde ${Math.ceil((question.config.buttonTimer * 1000 - (Date.now() - startTime)) / 1000)}s...`
                    : question.config.buttonText || "Continuar"}
                  {buttonActive && question.config.buttonShowIcon && <ArrowRight className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MultipleChoiceComponent({ question }: { question: Question }) {
  const { updateQuestion } = useQuizStore()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { themeColor } = useQuizStore()

  // Usar as opções do estado da questão ou inicializar com valores padrão
  const options = question.options || [
    { id: "1", text: "19 - 29", icon: "smile" },
    { id: "2", text: "29 - 39", icon: "smile" },
    { id: "3", text: "39 - 49", icon: "smile" },
    { id: "4", text: "50+", icon: "smile" },
  ]

  const handleAddOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: `Opção ${options.length + 1}`,
      icon: options[0]?.icon || "smile",
    }

    updateQuestion(question.id, {
      options: [...options, newOption],
    })
  }

  const handleChangeOption = (id: string, value: string) => {
    updateQuestion(question.id, {
      options: options.map((opt) => (opt.id === id ? { ...opt, text: value } : opt)),
    })
  }

  const handleChangeIcon = (id: string, icon: string) => {
    updateQuestion(question.id, {
      options: options.map((opt) => {
        if (opt.id === id) {
          return { ...opt, icon: icon }
        }
        return opt
      }),
    })
  }

  const handleRemoveOption = (id: string) => {
    updateQuestion(question.id, {
      options: options.filter((opt) => opt.id !== id),
    })
  }

  const moveOption = (dragIndex: number, hoverIndex: number) => {
    const newOptions = [...options]
    const draggedItem = newOptions[dragIndex]

    // Remover o item arrastado
    newOptions.splice(dragIndex, 1)
    // Inserir o item na nova posição
    newOptions.splice(hoverIndex, 0, draggedItem)

    updateQuestion(question.id, {
      options: newOptions,
    })
  }

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <DraggableOption
          key={option.id}
          id={option.id}
          index={index}
          text={option.text}
          icon={option.icon}
          isSelected={index === selectedOption}
          onSelect={() => setSelectedOption(index)}
          onChange={(value) => handleChangeOption(option.id, value)}
          onChangeIcon={(icon) => handleChangeIcon(option.id, icon)}
          onRemove={() => handleRemoveOption(option.id)}
          moveOption={moveOption}
          showIcon={question.config.showIcon}
          centerContent={question.config.centerContent || false}
        />
      ))}

      <button
        className="flex items-center justify-center w-full gap-2 p-3 text-sm text-[#667085] border border-dashed border-[#d0d5dd] rounded-md hover:bg-[#f9fafb] transition-colors"
        onClick={handleAddOption}
      >
        <PlusCircle className="w-4 h-4" />
        <span>Adicionar nova opção</span>
      </button>
    </div>
  )
}

interface DraggableOptionProps {
  id: string
  index: number
  text: string
  icon: string
  isSelected: boolean
  showIcon: boolean
  centerContent: boolean
  onSelect: () => void
  onChange: (value: string) => void
  onChangeIcon: (icon: string) => void
  onRemove: () => void
  moveOption: (dragIndex: number, hoverIndex: number) => void
}

function DraggableOption({
  id,
  index,
  text,
  icon,
  isSelected,
  showIcon,
  centerContent,
  onSelect,
  onChange,
  onChangeIcon,
  onRemove,
  moveOption,
}: DraggableOptionProps) {
  const { previewThemeColor } = useQuizStore()
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop({
    accept: "OPTION_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Não substituir itens consigo mesmos
      if (dragIndex === hoverIndex) {
        return
      }

      // Determinar retângulo na tela
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Obter o ponto médio vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determinar posição do mouse
      const clientOffset = monitor.getClientOffset()

      // Obter pixels para o topo
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Apenas realizar a movimentação quando o mouse cruzar metade da altura do item
      // Quando arrastar para baixo, apenas mover quando o cursor estiver abaixo de 50%
      // Quando arrastar para cima, apenas mover quando o cursor estiver acima de 50%

      // Arrastando para baixo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Arrastando para cima
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Hora de realmente realizar a ação
      moveOption(dragIndex, hoverIndex)

      // Nota: estamos mutando o item monitor aqui!
      // Geralmente não é recomendado, mas é a maneira mais fácil de
      // coordenar com o React DnD para atualizar o índice do item arrastado
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "OPTION_ITEM",
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

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

  const emojiOptions = [
    { value: "sad", label: "🙁" },
    { value: "happy", label: "😀" },
    { value: "smile", label: "🙂" },
    { value: "angry", label: "😡" },
    { value: "thumbsup", label: "👍" },
    { value: "thumbsdown", label: "👎" },
  ]

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
        isSelected ? "border-2 border-[var(--theme-color)]" : "border border-[#e6e6e6] hover:border-[#d0d5dd]"
      } ${centerContent ? "justify-center" : ""}`}
      onClick={onSelect}
      style={{
        borderColor: isSelected ? previewThemeColor : undefined,
        backgroundColor: isSelected ? `${previewThemeColor}10` : undefined,
        opacity,
        borderRadius: "12px",
      }}
      data-handler-id={handlerId}
    >
      <GripVertical className="w-5 h-5 text-[#d0d5dd] cursor-grab flex-shrink-0" />

      <Input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent break-words ${centerContent ? "text-center" : ""}`}
        placeholder="Digite uma opção"
        onClick={(e) => e.stopPropagation()}
      />

      {showIcon && (
        <Button
          variant="ghost"
          size="icon"
          className="text-[#667085] hover:text-[var(--theme-color)] hover:bg-transparent flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            // Não faz nada ao clicar - a edição agora é feita pelo painel lateral
          }}
        >
          {renderEmoji(icon)}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="text-[#667085] hover:text-red-500 hover:bg-transparent flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

// Corrigir o componente ImageComponent para garantir que o drag and drop funcione corretamente
// e que as mudanças sejam refletidas na pré-visualização

function ImageComponent({
  question,
  onTitleChange,
  onSubtitleChange,
  isTitleFocused,
  isSubtitleFocused,
  setIsTitleFocused,
  setIsSubtitleFocused,
}: {
  question: Question
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubtitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isTitleFocused: boolean
  isSubtitleFocused: boolean
  setIsTitleFocused: (focused: boolean) => void
  setIsSubtitleFocused: (focused: boolean) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { updateQuestion, reorderImageElements } = useQuizStore()
  const { previewThemeColor } = useQuizStore()

  // Initialize imageElements if not present
  useEffect(() => {
    if (!question.imageElements) {
      updateQuestion(question.id, {
        imageElements: [
          { id: "1", type: "image" },
          { id: "2", type: "title" },
          { id: "3", type: "cta" },
          { id: "4", type: "input" },
        ],
      })
    }
  }, [question.id, question.imageElements, updateQuestion])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        // Update the question with the image URL
        updateQuestion(question.id, {
          imageUrl: reader.result as string,
          config: {
            ...question.config,
            imagePosition: "top", // Sempre definir como "top"
          },
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Use the image URL from the question state if available
  const imageUrl = previewUrl || question.imageUrl

  // Render a specific element based on its type
  const renderElement = (element: ImageElement) => {
    switch (element.type) {
      case "image":
        return (
          <div className="mb-4">
            {imageUrl ? (
              <div className="relative">
                <div className="rounded-lg overflow-hidden h-[200px]">
                  <img src={imageUrl || "/placeholder.svg"} alt="Background" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white text-red-500 border-white"
                    onClick={() => {
                      setPreviewUrl(null)
                      updateQuestion(question.id, { imageUrl: null })
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#d0d5dd] rounded-lg p-8 text-center relative">
                <ImageIcon />
                <p className="mt-2 text-[#667085]">Arraste uma imagem ou clique para fazer upload</p>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>
        )
      case "title":
        if (question.config.showTitles) {
          return (
            <div className="mb-4">
              <div className="relative group mb-2">
                <div className={`relative ${isTitleFocused ? "border border-[var(--theme-color)] rounded-md" : ""}`}>
                  <input
                    value={question.title}
                    onChange={onTitleChange}
                    onFocus={(e) => setIsTitleFocused(true)}
                    className="text-xl font-semibold text-[#101828] w-full p-2 outline-none bg-transparent"
                    placeholder="Escreva aqui o título da sua questão"
                    onBlur={() => setIsTitleFocused(false)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Pencil className="w-4 h-4 text-[#667085] cursor-pointer" />
                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateQuestion(question.id, { title: "" })
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className={`relative ${isSubtitleFocused ? "border border-[var(--theme-color)] rounded-md" : ""}`}>
                  <input
                    value={question.subtitle || ""}
                    onChange={onSubtitleChange}
                    onFocus={(e) => setIsSubtitleFocused(true)}
                    className="text-[#667085] w-full p-2 outline-none bg-transparent"
                    placeholder="Subtítulo da questão (opcional)"
                    onBlur={() => setIsSubtitleFocused(false)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Pencil className="w-4 h-4 text-[#667085] cursor-pointer" />
                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateQuestion(question.id, { subtitle: "" })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return null
      case "cta":
        if (question.config.showImageCta) {
          return (
            <div className={`mb-4 ${question.config.ctaFullWidth ? "" : "flex justify-center"}`}>
              <Button
                className={`py-2 px-4 ${question.config.ctaFullWidth ? "w-full" : ""}`}
                style={{
                  backgroundColor: previewThemeColor,
                  borderRadius: question.config.buttonRounded ? "9999px" : "0.375rem",
                  color: "white",
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

  return (
    <div className="space-y-4">
      <div className="p-4 border border-[#e6e6e6] rounded-lg">
        {/* Render elements in the order defined by imageElements */}
        {question.imageElements?.map((element, index) => (
          <DraggableImageElement
            key={element.id}
            element={element}
            index={index}
            onReorder={(fromIndex, toIndex) => reorderImageElements(question.id, fromIndex, toIndex)}
          >
            {renderElement(element)}
          </DraggableImageElement>
        ))}
      </div>
    </div>
  )
}

// Melhorar o componente DraggableImageElement para garantir que o drag and drop funcione corretamente
function DraggableImageElement({
  element,
  index,
  children,
  onReorder,
}: {
  element: ImageElement
  index: number
  children: React.ReactNode
  onReorder: (fromIndex: number, toIndex: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop({
    accept: "IMAGE_ELEMENT",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Não substituir itens consigo mesmos
      if (dragIndex === hoverIndex) {
        return
      }

      // Determinar retângulo na tela
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Obter o ponto médio vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determinar posição do mouse
      const clientOffset = monitor.getClientOffset()

      // Obter pixels para o topo
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Apenas realizar a movimentação quando o mouse cruzar metade da altura do item
      // Quando arrastar para baixo, apenas mover quando o cursor estiver abaixo de 50%
      // Quando arrastar para cima, apenas mover quando o cursor estiver acima de 50%

      // Arrastando para baixo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Arrastando para cima
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Hora de realmente realizar a ação\
      onReorder(dragIndex, hoverIndex)

      // Nota: estamos mutando o item monitor aqui!
      // Geralmente não é recomendado, mas é a maneira mais fácil de
      // coordenar com o React DnD para atualizar o índice do item arrastado
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "IMAGE_ELEMENT",
    item: () => {
      return { id: element.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Skip rendering if there's no content
  if (!children) {
    return null
  }

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="relative group border border-transparent hover:border-dashed hover:border-[#d0d5dd] p-2 rounded-md"
    >
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-5 h-5 text-[#667085] cursor-grab" />
      </div>
      {children}
    </div>
  )
}

// Modificar o componente VideoComponent para que o vídeo se adapte ao tamanho da tela sem criar scroll
// Especificamente para o modo "full"
function VideoComponent({ question, viewMode }: { question: Question; viewMode: "desktop" | "mobile" }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { updateQuestion } = useQuizStore()
  const { previewThemeColor } = useQuizStore()
  const videoContainerRef = useRef<HTMLDivElement>(null)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      // Limpar a URL do YouTube quando um vídeo é carregado
      updateQuestion(question.id, { youtubeUrl: "" })
    }
  }

  const videoSize = question.config.videoSize || "large"
  const videoFormat = question.config.videoFormat || "landscape"
  const hideDescription = question.config.hideDescription || false
  const centerDescription = question.config.centerDescription || false
  const isFullSize = videoSize === "full"
  const isPortrait = videoFormat === "portrait"

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateQuestion(question.id, {
      videoDescription: e.target.value,
    })
  }

  // Extrair o ID do vídeo do YouTube da URL
  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null

    // Verificar se é um YouTube Short
    const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/
    const shortsMatch = url.match(shortsRegExp)

    if (shortsMatch && shortsMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${shortsMatch[2]}`
    }

    // Padrões de URL do YouTube padrão
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const youtubeEmbedUrl = getYoutubeEmbedUrl(question.youtubeUrl)
  const hasVideo = previewUrl || youtubeEmbedUrl

  // Renderização para tamanho "full"
  if (isFullSize) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        {hasVideo ? (
          // Para o modo "full", modificar o container do vídeo:
          <div
            ref={videoContainerRef}
            className="relative flex-1 flex items-center justify-center overflow-hidden"
            style={{ height: viewMode === "mobile" ? "calc(100% - 120px)" : "auto" }}
          >
            {previewUrl ? (
              <video
                src={previewUrl}
                controls
                className={`${isPortrait ? "h-full max-h-full" : "w-full"} object-contain rounded-lg`}
                style={{ overflow: "hidden" }}
              />
            ) : youtubeEmbedUrl ? (
              <div className={`${isPortrait ? "h-full" : "w-full"} flex items-center justify-center overflow-hidden`}>
                <iframe
                  src={youtubeEmbedUrl}
                  className={isPortrait ? "h-full max-h-[calc(100vh-180px)]" : "w-full"}
                  style={{
                    ...(isPortrait ? { aspectRatio: "9/16", maxHeight: "100%" } : { aspectRatio: "16/9" }),
                    overflow: "hidden",
                    border: "none",
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : null}

            <button
              className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"
              onClick={() => {
                setPreviewUrl(null)
                updateQuestion(question.id, { youtubeUrl: "" })
              }}
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
            <VideoIcon />
            <p className="mt-4 mb-6">Adicione um vídeo para visualizar</p>

            <div className="w-4/5 space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center relative">
                <p className="text-white/70">Arraste um vídeo ou clique para fazer upload</p>
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleVideoUpload}
                />
              </div>
              <p className="text-center text-white/50 text-sm">
                Ou adicione uma URL do YouTube no painel de configuração
              </p>
            </div>
          </div>
        )}

        {!hideDescription && hasVideo && (
          <div className={`p-4 ${centerDescription ? "text-center" : ""} bg-black text-white flex-shrink-0`}>
            <Textarea
              value={question.videoDescription || ""}
              onChange={handleDescriptionChange}
              placeholder="Descrição do vídeo ou instruções para o usuário..."
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
            />
          </div>
        )}
      </div>
    )
  }

  // Renderização normal (não full) - sempre com vídeo no topo
  return (
    <div className="flex flex-col gap-4">
      {/* Para o modo normal, modificar o container do vídeo: */}
      <div className="w-full">
        {previewUrl ? (
          <div className="relative w-full">
            <video
              src={previewUrl}
              controls
              className={`w-full ${isPortrait ? "aspect-[9/16]" : "aspect-video"} object-cover rounded-lg`}
            />
            <button
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
              onClick={() => setPreviewUrl(null)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : youtubeEmbedUrl ? (
          <div className="w-full overflow-hidden">
            <iframe
              src={youtubeEmbedUrl}
              className="w-full rounded-lg"
              style={{
                ...(isPortrait ? { aspectRatio: "9/16" } : { aspectRatio: "16/9" }),
                overflow: "hidden",
                border: "none",
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#d0d5dd] rounded-lg p-4 text-center relative w-full">
            <VideoIcon />
            <p className="mt-2 text-[#667085]">Arraste um vídeo ou clique para fazer upload</p>
            <p className="mt-2 text-sm text-[#667085]">Ou adicione uma URL do YouTube no painel de configuração</p>
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleVideoUpload}
            />
          </div>
        )}
      </div>
      {!hideDescription && (
        <div className={`w-full ${centerDescription ? "text-center" : ""}`}>
          <Textarea
            value={question.videoDescription || ""}
            onChange={handleDescriptionChange}
            placeholder="Descrição do vídeo ou instruções para o usuário..."
            className="w-full border-[#d0d5dd] min-h-[100px] rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

// Modificar a função TextComponent para não usar mais o drag and drop
function TextComponent({
  question,
  onAddInput,
  onRemoveInput,
  onReorderInputs,
}: {
  question: Question
  onAddInput: (type: "text" | "email" | "phone") => void
  onRemoveInput: (inputId: string) => void
  onReorderInputs: (questionId: string, fromIndex: number, toIndex: number) => void
}) {
  // Modificar para iniciar com apenas um campo de texto
  useEffect(() => {
    // Se não houver inputs, adicionar um campo de texto por padrão
    if (question.inputs.length === 0) {
      onAddInput("text")
    }
  }, [question.id, question.inputs.length, onAddInput])

  return (
    <div className="space-y-4">
      {question.inputs.map((input, index) => (
        <DraggableInput
          key={input.id}
          input={input}
          index={index}
          questionId={question.id}
          onRemove={() => onRemoveInput(input.id)}
          onReorder={onReorderInputs}
          showIcon={question.config.showIcon}
        />
      ))}

      <button
        className="flex items-center justify-center w-full gap-2 p-3 text-sm text-[#667085] border border-dashed border-[#d0d5dd] rounded-md hover:bg-[#f9fafb] transition-colors"
        onClick={() => {
          // Mostrar opções para adicionar diferentes tipos de campos
          const inputTypes = [
            { type: "text", icon: <User className="w-4 h-4 mr-2" />, label: "Texto" },
            { type: "phone", icon: <Phone className="w-4 h-4 mr-2" />, label: "Telefone" },
            { type: "email", icon: <AtSign className="w-4 h-4 mr-2" />, label: "Email" },
          ]

          // Adicionar o tipo de campo que não existe ainda
          const existingTypes = question.inputs.map((input) => input.type)
          const typeToAdd = inputTypes.find((t) => !existingTypes.includes(t.type as any))?.type || "text"
          onAddInput(typeToAdd as "text" | "email" | "phone")
        }}
      >
        <PlusCircle className="w-4 h-4" />
        <span>Adicionar novo campo</span>
      </button>
    </div>
  )
}

// Modificar a interface DraggableInput para incluir o label
// Substituir a função DraggableInput por esta versão simplificada sem drag and drop e sem ícone
// Modificar a função DraggableInput para não permitir a edição do placeholder directly
function DraggableInput({
  input,
  index,
  questionId,
  onRemove,
  onReorder,
  showIcon = false,
}: {
  input: { id: string; type: string; placeholder: string; mask?: string; iconType?: string; label?: string }
  index: number
  questionId: string
  onRemove: () => void
  onReorder: (questionId: string, fromIndex: number, toIndex: number) => void
  showIcon?: boolean
}) {
  const { updateQuestion } = useQuizStore()
  const [isLabelFocused, setIsLabelFocused] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { questions } = useQuizStore.getState()
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      const updatedInputs = question.inputs.map((i) => (i.id === input.id ? { ...i, label: e.target.value } : i))
      updateQuestion(questionId, { inputs: updatedInputs })
    }
  }

  // Determinar o label padrão com base no tipo de input
  const getDefaultLabel = () => {
    return "Campo"
  }

  // Determinar o placeholder com base no tipo/máscara
  const getPlaceholder = () => {
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

  return (
    <div className="mb-4">
      {/* Label do input */}
      <div className="relative group mb-2">
        <div className={`relative ${isLabelFocused ? "border border-[var(--theme-color)] rounded-md" : ""}`}>
          <input
            value={input.label || ""}
            onChange={handleLabelChange}
            onFocus={() => setIsLabelFocused(true)}
            className="text-sm font-medium text-[#101828] w-full p-2 outline-none bg-transparent"
            placeholder={getDefaultLabel()}
            onBlur={() => setIsLabelFocused(false)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="w-4 h-4 text-[#667085]" />
          </div>
        </div>
      </div>

      {/* Input sem ícone e com botão de remover */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            className={`w-full border-[#d0d5dd] ${isInputFocused ? "ring-2 ring-[var(--theme-color)]" : ""}`}
            type={input.type}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            readOnly={true}
            value=""
          />
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-500">
            {getPlaceholder()}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onRemove} className="text-[#667085] hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Mensagem de ajuda para o formato */}
      {(input.type === "email" || input.mask) && (
        <div className="text-xs text-gray-500 mt-1">
          {input.type === "email" && "Formato de email válido: exemplo@dominio.com"}
          {input.mask && `Formato esperado: ${input.mask}`}
        </div>
      )}
    </div>
  )
}

function LongTextComponent({ question }: { question: Question }) {
  const [text, setText] = useState("")
  const { updateQuestion } = useQuizStore()
  const maxCharsValue = question.config.maxCharsValue || "0 - 500"
  const maxChars = Number.parseInt(maxCharsValue.split("-")[1]?.trim() || "500", 10)
  const remainingChars = maxChars - text.length

  useEffect(() => {
    // Atualizar o texto no store quando o componente for montado
    if (question.longTextValue) {
      setText(question.longTextValue)
    }
  }, [question.longTextValue])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (question.config.maxChars && newText.length > maxChars) {
      return
    }
    setText(newText)
    updateQuestion(question.id, { longTextValue: newText })
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Digite seu texto aqui..."
        className="min-h-[150px] border-[#d0d5dd]"
        maxLength={question.config.maxChars ? maxChars : undefined}
      />
      {question.config.maxChars && (
        <div className="text-right text-sm text-[#667085]">{remainingChars} caracteres restantes</div>
      )}
    </div>
  )
}
