"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Upload, Trash2 } from "lucide-react"
import { useQuizStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const colorOptions = [
  { name: "Laranja", value: "#ff9811" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Cinza", value: "#6b7280" },
]

export default function ThemeCustomizer({ onClose }: { onClose: () => void }) {
  const {
    previewThemeColor,
    setPreviewThemeColor,
    customLogo,
    setCustomLogo,
    buttonRounded,
    setButtonRounded,
    buttonStyle,
    setButtonStyle,
  } = useQuizStore()
  const [selectedColor, setSelectedColor] = useState(previewThemeColor)
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogo)
  const [roundedButtons, setRoundedButtons] = useState(buttonRounded)
  const [buttonStylePreview, setButtonStylePreview] = useState<"primary" | "secondary">(buttonStyle || "primary")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar a variável CSS quando a cor for alterada
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", selectedColor)
  }, [selectedColor])

  const handleApply = () => {
    setPreviewThemeColor(selectedColor)
    setCustomLogo(logoPreview)
    setButtonRounded(roundedButtons)
    setButtonStyle(buttonStylePreview)

    // Atualizar a variável CSS quando aplicar as alterações
    document.documentElement.style.setProperty("--theme-color", selectedColor)

    onClose()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Personalizar Tema</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="colors">Cores</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="buttons">Botões</TabsTrigger>
          </TabsList>
          <TabsContent value="colors" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Cor do Quiz</h3>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className="flex flex-col items-center gap-1"
                    onClick={() => setSelectedColor(color.value)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full cursor-pointer transition-all ${
                        selectedColor === color.value ? "ring-2 ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: color.value, ringColor: color.value }}
                    ></div>
                    <span className="text-xs text-[#667085]">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Pré-visualização</h3>
              <div className="p-4 border border-[#e6e6e6] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="font-bold text-xl">
                    <span className="text-black">quiz</span>
                    <span style={{ color: selectedColor }}>lead</span>
                  </div>
                  <button
                    className={`px-3 py-1 text-sm text-white rounded ${roundedButtons ? "rounded-full" : ""}`}
                    style={{ backgroundColor: selectedColor }}
                  >
                    Botão
                  </button>
                </div>
                <div className="w-full bg-[#f2f4f7] rounded-full h-2 mb-4">
                  <div className="h-2 rounded-full" style={{ backgroundColor: selectedColor, width: "60%" }}></div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{ borderColor: selectedColor, backgroundColor: selectedColor }}
                  ></div>
                  <span>Opção selecionada</span>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="logo" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Logo Personalizado</h3>
              <p className="text-sm text-[#667085] mb-4">
                Faça upload de um logo personalizado para substituir o logo padrão "quizlead".
              </p>

              {logoPreview ? (
                <div className="border border-[#e6e6e6] rounded-lg p-4 flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo personalizado"
                      className="max-h-16 max-w-full"
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#667085]"
                  >
                    Alterar logo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#d0d5dd] rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#667085] mb-2" />
                    <p className="text-sm text-[#667085] mb-4">Arraste uma imagem ou clique para fazer upload</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#667085]"
                    >
                      Selecionar arquivo
                    </Button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Pré-visualização</h3>
              <div className="p-4 border border-[#e6e6e6] rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {logoPreview ? (
                      <img src={logoPreview || "/placeholder.svg"} alt="Logo personalizado" className="max-h-8" />
                    ) : (
                      <div className="font-bold text-lg">
                        <span className="text-black">quiz</span>
                        <span style={{ color: selectedColor }}>lead</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[#667085]">1 de 5</span>
                </div>
                <div className="w-full bg-[#f2f4f7] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ backgroundColor: selectedColor, width: "20%" }}></div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="buttons" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Estilo dos Botões</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Botões Arredondados</span>
                  <Switch
                    checked={roundedButtons}
                    onCheckedChange={setRoundedButtons}
                    className="data-[state=checked]:bg-[#ff9811]"
                    style={{ "--theme-color": selectedColor } as React.CSSProperties}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Estilo do Botão</span>
                  <div className="flex gap-2">
                    <Button
                      variant={buttonStylePreview === "primary" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setButtonStylePreview("primary")}
                      style={{ backgroundColor: buttonStylePreview === "primary" ? selectedColor : undefined }}
                    >
                      Primário
                    </Button>
                    <Button
                      variant={buttonStylePreview === "secondary" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setButtonStylePreview("secondary")}
                      style={{
                        backgroundColor: buttonStylePreview === "secondary" ? "white" : undefined,
                        borderColor: buttonStylePreview === "secondary" ? selectedColor : undefined,
                        color: buttonStylePreview === "secondary" ? selectedColor : undefined,
                      }}
                    >
                      Secundário
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-[#e6e6e6] rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Pré-visualização</h4>
                  <div className="flex flex-col gap-3">
                    <button
                      className="px-4 py-2 text-white w-full"
                      style={{
                        backgroundColor: buttonStylePreview === "primary" ? selectedColor : "transparent",
                        borderRadius: roundedButtons ? "9999px" : "0.375rem",
                        color: buttonStylePreview === "primary" ? "white" : selectedColor,
                        border: buttonStylePreview === "secondary" ? `1px solid ${selectedColor}` : "none",
                      }}
                    >
                      Botão Principal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply} style={{ backgroundColor: selectedColor }}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  )
}
