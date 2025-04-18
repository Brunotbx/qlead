"use client"
import { useState, useRef } from "react"
import type React from "react"

import { type Question, useQuizStore, type ImageElementType } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleChoiceIcon, ImageIcon, VideoIcon, TextIcon, LongTextIcon } from "./components-list"
import { Upload, X, ExternalLink } from "lucide-react"
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
    let formattedMask = ""

    // Converter as máscaras para nosso formato personalizado
    switch (mask) {
      case "(99) 99999-9999":
        formattedMask = "(99) 99999-9999"
        break
      case "(99) 9999-9999":
        formattedMask = "(99) 9999-9999"
        break
      case "99999-999":
        formattedMask = "99999-999"
        break
      case "999.999.999-99":
        formattedMask = "999.999.999-99"
        break
      default:
        formattedMask = mask
    }

    updateInputMask(question.id, inputId, formattedMask)
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
          {question.componentType !== "video" && question.componentType !== "multiple-choice" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#667085]">Obrigatório</span>
              <Switch
                checked={question.config.required}
                onCheckedChange={() => handleToggle("required")}
                className="data-[state=checked]:bg-[#ff9811]"
              />
            </div>
          )}

          {question.componentType !== "multiple-choice" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#667085]">Títulos</span>
                <Switch
                  checked={question.config.showTitles}
                  onCheckedChange={() => handleToggle("showTitles")}
                  className="data-[state=checked]:bg-[#ff9811]"
                />
              </div>

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

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">Arredondado</span>
                    <Switch
                      checked={question.config.buttonRounded || false}
                      onCheckedChange={() => handleToggle("buttonRounded")}
                      className="data-[state=checked]:bg-[#ff9811]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">Mostrar ícone</span>
                    <Switch
                      checked={question.config.buttonShowIcon || false}
                      onCheckedChange={() => handleToggle("buttonShowIcon")}
                      className="data-[state=checked]:bg-[#ff9811]"
                    />
                  </div>
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
                  <span className="text-sm text-[#667085]">
                    Campo {index + 1}: {input.type === "text" ? "Texto" : input.type === "email" ? "Email" : "Telefone"}
                  </span>
                </div>

                {input.type === "phone" && (
                  <div>
                    <span className="text-xs text-[#667085] block mb-1">Máscara</span>
                    <Select
                      value={input.mask || "(99) 99999-9999"}
                      onValueChange={(value) => handleInputMaskChange(input.id, value)}
                    >
                      <SelectTrigger className="w-full border-[#d0d5dd]">
                        <SelectValue placeholder="Selecione uma máscara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="(99) 99999-9999">Celular: (99) 99999-9999</SelectItem>
                        <SelectItem value="(99) 9999-9999">Fixo: (99) 9999-9999</SelectItem>
                        <SelectItem value="99999-999">CEP: 99999-999</SelectItem>
                        <SelectItem value="999.999.999-99">CPF: 999.999.999-99</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {input.type === "text" && (
                  <div>
                    <span className="text-xs text-[#667085] block mb-1">Tipo</span>
                    <Select
                      defaultValue="text"
                      onValueChange={(value) => {
                        // Atualizar tipo de campo
                      }}
                    >
                      <SelectTrigger className="w-full border-[#d0d5dd]">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
