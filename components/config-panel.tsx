"use client"
import { useState, useRef } from "react"
import type React from "react"

import { type Question, useQuizStore, type ImageElementType } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleChoiceIcon, ImageIcon, VideoIcon, TextIcon, LongTextIcon } from "./components-list"
import { Upload, X, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfigPanel({ question }: { question: Question }) {
  const { updateQuestion, updateInputMask, updateQuestionIcon } = useQuizStore()
  const [iconName, setIconName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { previewThemeColor } = useQuizStore()

  const handleToggle = (field: keyof Question["config"]) => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        [field]: !question.config[field],
      },
    })
  }

  const handleMaxCharsChange = (value: string) => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        maxCharsValue: value,
      },
    })
  }

  const handleVideoSizeChange = (size: "small" | "large" | "full") => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        videoSize: size,
      },
    })
  }

  const handleIconPositionChange = (position: "left" | "center" | "right") => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        iconPosition: position,
      },
    })
  }

  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        buttonText: e.target.value,
      },
    })
  }

  // Remover a função handleVideoPositionChange
  const handleVideoPositionChange = (position: "top" | "bottom") => {
    updateQuestion(question.id, {
      config: {
        ...question.config,
        videoPosition: position,
      },
    })
  }

  // Adicionar a função handleButtonTimerChange
  const handleButtonTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    updateQuestion(question.id, {
      config: {
        ...question.config,
        buttonTimer: value >= 0 ? value : 0,
      },
    })
  }

  // Modificar a função de máscara para usar nossa implementação personalizada
  const handleInputMaskChange = (inputId: string, mask: string) => {
    // Obter a questão atual e o input específico
    const currentQuestion = question
    const currentInput = currentQuestion.inputs.find((input) => input.id === inputId)

    if (!currentInput) return

    // Determinar o tipo e a máscara com base na seleção
    let updatedType = "text"
    let updatedMask = ""
    let updatedPlaceholder = currentInput.placeholder || "Insira sua resposta aqui"

    if (mask === "email") {
      updatedType = "email"
      updatedMask = ""
      updatedPlaceholder = "email@exemplo.com"
    } else if (mask === "none") {
      updatedType = "text"
      updatedMask = ""
    } else if (mask === "(99) 9999-9999" || mask === "(99) 99999-9999") {
      updatedType = "text"
      updatedMask = mask
      updatedPlaceholder = "(00) 00000-0000"
    } else if (mask === "99/99/9999") {
      updatedType = "text"
      updatedMask = mask
      updatedPlaceholder = "dd/mm/aaaa"
    } else if (mask === "123...") {
      updatedType = "number"
      updatedMask = ""
      updatedPlaceholder = "Digite um número"
    } else {
      updatedType = "text"
      updatedMask = mask
    }

    // Atualizar o input com os novos valores
    const updatedInputs = currentQuestion.inputs.map((input) => {
      if (input.id === inputId) {
        return {
          ...input,
          type: updatedType,
          mask: updatedMask,
          placeholder: updatedPlaceholder,
        }
      }
      return input
    })

    // Atualizar a questão
    updateQuestion(question.id, { inputs: updatedInputs })

    // Forçar atualização do localStorage
    setTimeout(() => {
      useQuizStore.getState().updateLocalStorage()
    }, 0)
  }

  // Função para atualizar o placeholder de um input específico
  const handleInputPlaceholderChange = (inputId: string, placeholder: string) => {
    updateQuestion(question.id, {
      inputs: question.inputs.map((input) => (input.id === inputId ? { ...input, placeholder } : input)),
    })
  }

  // Nova função para alternar o estado "required" de um input específico
  const handleInputRequiredToggle = (inputId: string) => {
    updateQuestion(question.id, {
      inputs: question.inputs.map((input) => {
        if (input.id === inputId) {
          return {
            ...input,
            required: !input.required,
          }
        }
        return input
      }),
    })
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        updateQuestionIcon(question.id, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveIcon = () => {
    updateQuestionIcon(question.id, "")
    setIconName("")
  }

  // Get element labels for the image component
  const getElementLabel = (type: ImageElementType): string => {
    switch (type) {
      case "image":
        return "Imagem"
      case "title":
        return "Título"
      case "cta":
        return "Botão CTA"
      case "input":
        return "Campo de texto"
      default:
        return "Elemento"
    }
  }

  return (
    <div className="w-72 border-l border-[#e6e6e6] bg-white overflow-y-auto">
      <div className="p-6 border-b border-[#e6e6e6]">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-[#344054]">
            {question.componentType === "text"
              ? "Texto"
              : question.componentType === "multiple-choice"
                ? "Múltipla Escolha"
                : question.componentType === "image"
                  ? "Imagem"
                  : question.componentType === "video"
                    ? "Vídeo"
                    : question.componentType === "final-screen"
                      ? "Tela Final"
                      : "Texto longo"}
          </h2>
          <div className="text-[#ff9811]">
            {question.componentType === "text" && <TextIcon />}
            {question.componentType === "multiple-choice" && <MultipleChoiceIcon />}
            {question.componentType === "image" && <ImageIcon />}
            {question.componentType === "video" && <VideoIcon />}
            {question.componentType === "long-text" && <LongTextIcon />}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-[#e6e6e6]">
        <h2 className="font-medium text-[#344054] mb-4">Configurações</h2>

        <div className="space-y-4">
          {question.componentType !== "video" &&
            question.componentType !== "multiple-choice" &&
            question.componentType !== "final-screen" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Obrigatório</span>
                <Switch
                  checked={question.config.required}
                  onCheckedChange={() => handleToggle("required")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>
            )}

          {question.componentType !== "multiple-choice" && question.componentType !== "final-screen" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Caracteres máximos</span>
                <Switch
                  checked={question.config.maxChars}
                  onCheckedChange={() => handleToggle("maxChars")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              {question.config.maxChars && (
                <Input
                  value={question.config.maxCharsValue}
                  onChange={(e) => handleMaxCharsChange(e.target.value)}
                  className="border-[#d0d5dd] text-sm"
                />
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Ícone</span>
                <Switch
                  checked={question.config.showIcon}
                  onCheckedChange={() => handleToggle("showIcon")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              {question.config.showIcon && (
                <>
                  <div className="mt-2">
                    <div className="flex items-center border border-[#d0d5dd] rounded-md p-2">
                      {iconName ? (
                        <>
                          <div className="flex-1 flex items-center">
                            <span className="text-[#ff9811] mr-2">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                                <path d="M2 17L12 22L22 17" fill="currentColor" />
                                <path d="M2 12L12 17L22 12" fill="currentColor" />
                              </svg>
                            </span>
                            <span className="text-xs truncate">{iconName}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleRemoveIcon}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 text-[#667085]"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload</span>
                        </Button>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleIconUpload}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-sm text-[#667085] block mb-2">Posição</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 border ${question.config.iconPosition === "left" ? "bg-[#ff9811] border-[#ff9811]" : "border-[#d0d5dd]"} rounded cursor-pointer flex items-center justify-center`}
                        onClick={() => handleIconPositionChange("left")}
                      >
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                      </div>
                      <div
                        className={`w-8 h-8 border ${question.config.iconPosition === "center" ? "bg-[#ff9811] border-[#ff9811]" : "border-[#d0d5dd]"} rounded cursor-pointer flex items-center justify-center`}
                        onClick={() => handleIconPositionChange("center")}
                      >
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                      </div>
                      <div
                        className={`w-8 h-8 border ${question.config.iconPosition === "right" ? "bg-[#ff9811] border-[#ff9811]" : "border-[#d0d5dd]"} rounded cursor-pointer flex items-center justify-center`}
                        onClick={() => handleIconPositionChange("right")}
                      >
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {question.componentType === "image" && (
            <div className="pt-4 border-t border-[#e6e6e6]">
              <h3 className="font-medium text-[#344054] mb-4">Imagem</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Texto sobre a imagem</span>
                  <Switch
                    checked={question.config.showTitles}
                    onCheckedChange={() => handleToggle("showTitles")}
                    className="data-[state=checked]:bg-[#ff9811]"
                  />
                </div>

                {/* Add option to toggle text input */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Mostrar campo de texto</span>
                  <Switch
                    checked={question.config.showImageInput || false}
                    onCheckedChange={() =>
                      updateQuestion(question.id, {
                        config: {
                          ...question.config,
                          showImageInput: !question.config.showImageInput,
                        },
                      })
                    }
                    className="data-[state=checked]:bg-[#ff9811]"
                  />
                </div>

                {/* Add option to toggle CTA button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Botão CTA adicional</span>
                  <Switch
                    checked={question.config.showImageCta || false}
                    onCheckedChange={() =>
                      updateQuestion(question.id, {
                        config: {
                          ...question.config,
                          showImageCta: !question.config.showImageCta,
                          imageCta: question.config.imageCta || { text: "Saiba mais", link: "#" },
                        },
                      })
                    }
                    className="data-[state=checked]:bg-[#ff9811]"
                  />
                </div>

                {/* CTA button settings */}
                {question.config.showImageCta && (
                  <div className="space-y-3 pl-2 border-l-2 border-[#f2f4f7]">
                    <div>
                      <span className="text-xs text-[#667085] block mb-1">Texto do botão</span>
                      <Input
                        value={question.config.imageCta?.text || "Saiba mais"}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            config: {
                              ...question.config,
                              imageCta: {
                                ...question.config.imageCta,
                                text: e.target.value,
                              },
                            },
                          })
                        }
                        className="border-[#d0d5dd] text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-[#667085] block mb-1">Link</span>
                      <div className="flex items-center gap-2">
                        <Input
                          value={question.config.imageCta?.link || "#"}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              config: {
                                ...question.config,
                                imageCta: {
                                  ...question.config.imageCta,
                                  link: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="https://exemplo.com"
                          className="border-[#d0d5dd] text-sm"
                        />
                        <ExternalLink className="w-4 h-4 text-[#667085]" />
                      </div>
                    </div>

                    {/* Add option for CTA button width */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#667085]">Largura total</span>
                      <Switch
                        checked={question.config.ctaFullWidth || false}
                        onCheckedChange={() =>
                          updateQuestion(question.id, {
                            config: {
                              ...question.config,
                              ctaFullWidth: !question.config.ctaFullWidth,
                            },
                          })
                        }
                        className="data-[state=checked]:bg-[#ff9811]"
                      />
                    </div>

                    {/* Remover a opção de arredondamento específica para o CTA, pois agora usaremos a mesma do botão principal */}
                  </div>
                )}

                {/* Remover a seção "Ordem dos elementos" */}
                {/* Element order section */}
                {/* <div className="pt-4 border-t border-[#e6e6e6]">
                  <h3 className="text-sm font-medium mb-3 text-[#344054]">Ordem dos elementos</h3>
                  <div className="space-y-2 text-sm text-[#667085]">
                    <p>Arraste os elementos na visualização para reordenar</p>
                    <div className="space-y-1">
                      {question.imageElements?.map((element, index) => (
                        <div key={element.id} className="flex items-center justify-between py-1">
                          <span>
                            {index + 1}. {getElementLabel(element.type)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          )}

          {question.componentType === "multiple-choice" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Obrigatório</span>
                <Switch
                  checked={question.config.required}
                  onCheckedChange={() => handleToggle("required")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Títulos</span>
                <Switch
                  checked={question.config.showTitles}
                  onCheckedChange={() => handleToggle("showTitles")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Ícone</span>
                <Switch
                  checked={question.config.showIcon}
                  onCheckedChange={() => handleToggle("showIcon")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Centralizar</span>
                <Switch
                  checked={question.config.centerContent || false}
                  onCheckedChange={() => handleToggle("centerContent")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Múltipla Seleção</span>
                <Switch
                  checked={question.config.multipleSelection || false}
                  onCheckedChange={() => handleToggle("multipleSelection")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

              {question.config.showIcon && (
                <div className="mt-4 pt-4 border-t border-[#e6e6e6]">
                  <h3 className="text-sm font-medium mb-3 text-[#344054]">Ícones das opções</h3>
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <span className="text-sm text-[#667085] truncate max-w-[150px]">
                          {option.text || `Opção ${index + 1}`}
                        </span>
                        <Select
                          value={option.icon}
                          onValueChange={(value) => {
                            const updatedOptions = [...(question.options || [])]
                            updatedOptions[index] = { ...updatedOptions[index], icon: value }
                            updateQuestion(question.id, { options: updatedOptions })
                          }}
                        >
                          <SelectTrigger className="w-24 border-[#d0d5dd]">
                            <SelectValue>
                              {option.icon === "sad" && "🙁"}
                              {option.icon === "happy" && "😀"}
                              {option.icon === "smile" && "🙂"}
                              {option.icon === "angry" && "😡"}
                              {option.icon === "thumbsup" && "👍"}
                              {option.icon === "thumbsdown" && "👎"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sad">🙁 Triste</SelectItem>
                            <SelectItem value="happy">😀 Feliz</SelectItem>
                            <SelectItem value="smile">🙂 Sorriso</SelectItem>
                            <SelectItem value="angry">😡 Bravo</SelectItem>
                            <SelectItem value="thumbsup">👍 Positivo</SelectItem>
                            <SelectItem value="thumbsdown">👎 Negativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Configurações do botão */}
          <div className="pt-4 border-t border-[#e6e6e6]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#667085]">Mostrar botão</span>
              <Switch
                checked={question.config.showButton || false}
                onCheckedChange={() => handleToggle("showButton")}
                className="data-[state=checked]:bg-[#ff9811]"
              />
            </div>

            {question.config.showButton && (
              <>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#667085] block mb-1">Texto do botão</span>
                    <Input
                      value={question.config.buttonText || "Continuar"}
                      onChange={handleButtonTextChange}
                      className="border-[#d0d5dd] text-sm"
                    />
                  </div>

                  {/* Adicionar a opção de timer para o botão */}
                  <div>
                    <span className="text-xs text-[#667085] block mb-1">Timer do botão (segundos)</span>
                    <Input
                      type="number"
                      min="0"
                      value={question.config.buttonTimer?.toString() || "0"}
                      onChange={handleButtonTimerChange}
                      className="border-[#d0d5dd] text-sm"
                      placeholder="0"
                    />
                    <p className="text-xs text-[#667085] mt-1">
                      {question.config.buttonTimer && question.config.buttonTimer > 0
                        ? `O botão ficará desativado por ${question.config.buttonTimer} segundos.`
                        : "O botão estará ativo imediatamente."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">Redirecionamento</span>
                    <Switch
                      checked={question.config.buttonRedirect || false}
                      onCheckedChange={() => handleToggle("buttonRedirect")}
                      className="data-[state=checked]:bg-[#ff9811]"
                    />
                  </div>

                  {question.config.buttonRedirect && (
                    <div>
                      <span className="text-xs text-[#667085] block mb-1">Link externo</span>
                      <div className="flex items-center gap-2">
                        <Input
                          value={question.config.buttonLink || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              config: {
                                ...question.config,
                                buttonLink: e.target.value,
                              },
                            })
                          }
                          placeholder="https://exemplo.com"
                          className="border-[#d0d5dd] text-sm"
                        />
                        <ExternalLink className="w-4 h-4 text-[#667085]" />
                      </div>
                    </div>
                  )}

                  {/* REMOVE the button show icon toggle */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {question.componentType === "video" && (
        <div className="p-6 border-b border-[#e6e6e6]">
          <h2 className="font-medium text-[#344054] mb-4">Vídeo</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm text-[#667085] block">Tamanho</span>
              <div className="flex items-center gap-2">
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() => handleVideoSizeChange("small")}
                >
                  <div
                    className={`w-5 h-5 ${question.config.videoSize === "small" ? "bg-[#ff9811]" : "border border-[#d0d5dd]"} rounded`}
                  ></div>
                  <span className="text-xs text-[#667085]">Pequeno</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() => handleVideoSizeChange("large")}
                >
                  <div
                    className={`w-5 h-5 ${question.config.videoSize === "large" ? "bg-[#ff9811]" : "border border-[#d0d5dd]"} rounded`}
                  ></div>
                  <span className="text-xs text-[#667085]">Grande</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() => handleVideoSizeChange("full")}
                >
                  <div
                    className={`w-5 h-5 ${question.config.videoSize === "full" ? "bg-[#ff9811]" : "border border-[#d0d5dd]"} rounded`}
                  ></div>
                  <span className="text-xs text-[#667085]">Tela cheia</span>
                </div>
              </div>
            </div>

            {/* Adicionar opção de formato de vídeo */}
            <div className="space-y-2">
              <span className="text-sm text-[#667085] block">Formato</span>
              <div className="flex items-center gap-2">
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      config: {
                        ...question.config,
                        videoFormat: "landscape",
                      },
                    })
                  }
                >
                  <div
                    className={`w-10 h-6 ${question.config.videoFormat !== "portrait" ? "bg-[#ff9811]" : "border border-[#d0d5dd]"} rounded flex items-center justify-center`}
                  >
                    <div className="w-8 h-4 bg-white rounded"></div>
                  </div>
                  <span className="text-xs text-[#667085]">Paisagem</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      config: {
                        ...question.config,
                        videoFormat: "portrait",
                      },
                    })
                  }
                >
                  <div
                    className={`w-6 h-10 ${question.config.videoFormat === "portrait" ? "bg-[#ff9811]" : "border border-[#d0d5dd]"} rounded flex items-center justify-center`}
                  >
                    <div className="w-4 h-8 bg-white rounded"></div>
                  </div>
                  <span className="text-xs text-[#667085]">Retrato</span>
                </div>
              </div>
            </div>

            {/* Adicionar campo de URL do YouTube */}
            <div className="space-y-2">
              <span className="text-sm text-[#667085] block">URL do YouTube</span>
              <Input
                value={question.youtubeUrl || ""}
                onChange={(e) => updateQuestion(question.id, { youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="border-[#d0d5dd] text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#667085]">Ocultar descrição</span>
              <Switch
                checked={question.config.hideDescription || false}
                onCheckedChange={() => handleToggle("hideDescription")}
                className="data-[state=checked]:bg-[#ff9811]"
              />
            </div>

            {!question.config.hideDescription && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Centralizar descrição</span>
                <Switch
                  checked={question.config.centerDescription || false}
                  onCheckedChange={() => handleToggle("centerDescription")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {question.componentType === "text" && question.inputs.length > 0 && (
        <div className="p-6 border-b border-[#e6e6e6]">
          <h2 className="font-medium text-[#344054] mb-4">Campos</h2>

          <div className="space-y-4">
            {question.inputs.map((input, index) => (
              <div key={input.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Campo {index + 1}</span>
                </div>

                <div>
                  <span className="text-xs text-[#667085] block mb-1">Tipo</span>
                  <Select
                    value={input.mask || "none"}
                    onValueChange={(value) => handleInputMaskChange(input.id, value)}
                  >
                    <SelectTrigger className="w-full border-[#d0d5dd]">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Texto</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="(99) 9999-9999">Telefone</SelectItem>
                      <SelectItem value="99/99/9999">Data</SelectItem>
                      <SelectItem value="123...">Número</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Adicionar campo para personalizar o placeholder */}
                <div>
                  <span className="text-xs text-[#667085] block mb-1">Placeholder</span>
                  <Input
                    value={input.placeholder || ""}
                    onChange={(e) => handleInputPlaceholderChange(input.id, e.target.value)}
                    className="border-[#d0d5dd] text-sm"
                    placeholder="Insira sua pergunta aqui"
                  />
                </div>

                {/* Adicionar opção para marcar o campo como obrigatório */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#667085]">Campo obrigatório</span>
                  <Switch
                    checked={input.required || false}
                    onCheckedChange={() => handleInputRequiredToggle(input.id)}
                    className="data-[state=checked]:bg-[#ff9811]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {question.componentType === "final-screen" && (
        <div className="p-6 border-b border-[#e6e6e6]">
          <h2 className="font-medium text-[#344054] mb-4">Tela Final</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#667085]">Exibir imagem</span>
              <Switch
                checked={question.config.showImage !== false}
                onCheckedChange={() =>
                  updateQuestion(question.id, {
                    config: {
                      ...question.config,
                      showImage: question.config.showImage === false ? true : false,
                    },
                  })
                }
                className="data-[state=checked]:bg-[#ff9811]"
              />
            </div>

            {question.config.showImage !== false && (
              <>
                {question.imageUrl ? (
                  <div className="relative">
                    <img
                      src={question.imageUrl || "/placeholder.svg"}
                      alt="Background"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 bg-white text-red-500 hover:bg-white/90 hover:text-red-600"
                      onClick={() => updateQuestion(question.id, { imageUrl: null })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-[#d0d5dd] rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            updateQuestion(question.id, { imageUrl: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }
                      input.click()
                    }}
                  >
                    <div className="w-6 h-6 text-[#667085]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#667085]">Arraste uma imagem ou clique para fazer upload</span>
                  </div>
                )}
              </>
            )}

            {/* Remover a seção de configuração do texto de chamada */}

            {/* CTA Button */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#667085]">Mostrar botão CTA</span>
              <Switch
                checked={question.config.showFinalCta || false}
                onCheckedChange={() =>
                  updateQuestion(question.id, {
                    config: {
                      ...question.config,
                      showFinalCta: !question.config.showFinalCta,
                    },
                  })
                }
                className="data-[state=checked]:bg-[#ff9811]"
              />
            </div>

            {question.config.showFinalCta && (
              <>
                <div>
                  <span className="text-xs text-[#667085] block mb-1">Texto do botão</span>
                  <Input
                    value={question.config.finalCtaText || "COMEÇAR"}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        config: {
                          ...question.config,
                          finalCtaText: e.target.value,
                        },
                      })
                    }
                    className="border-[#d0d5dd] text-sm"
                  />
                </div>

                <div className="mt-2">
                  <span className="text-xs text-[#667085] block mb-1">Link de redirecionamento</span>
                  <div className="flex items-center gap-2">
                    <Input
                      value={question.config.finalCtaLink || "#"}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          config: {
                            ...question.config,
                            finalCtaLink: e.target.value,
                          },
                        })
                      }
                      placeholder="https://exemplo.com"
                      className="border-[#d0d5dd] text-sm"
                    />
                    <ExternalLink className="w-4 h-4 text-[#667085]" />
                  </div>
                  <p className="text-xs text-[#667085] mt-1">
                    Deixe # para fechar a pesquisa ou insira uma URL para redirecionar.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Botão de largura total</span>
                  <Switch
                    checked={question.config.finalCtaFullWidth || false}
                    onCheckedChange={() =>
                      updateQuestion(question.id, {
                        config: {
                          ...question.config,
                          finalCtaFullWidth: !question.config.finalCtaFullWidth,
                        },
                      })
                    }
                    className="data-[state=checked]:bg-[#ff9811]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
