"use client"

import { useState } from "react"
import { Info, Copy, QrCode, Calendar, Lock, AlertCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import QRCodeGenerator from "./qr-code-generator"
import ConfirmationModal from "@/components/confirmation-modal"

interface PublishModalProps {
  quiz: any
  onClose: () => void
  onSave: (quizId: string, settings: any) => void
}

export default function PublishModal({ quiz, onClose, onSave }: PublishModalProps) {
  const [activeTab, setActiveTab] = useState("settings")
  const [customUrl, setCustomUrl] = useState(quiz?.publishedUrl || "")
  const [usePassword, setUsePassword] = useState(!!quiz?.password)
  const [password, setPassword] = useState(quiz?.password || "")
  const [useResponseLimit, setUseResponseLimit] = useState(!!quiz?.responseLimit)
  const [responseLimit, setResponseLimit] = useState(quiz?.responseLimit || 100)
  const [useExpiration, setUseExpiration] = useState(!!quiz?.expirationDate)
  const [expirationDate, setExpirationDate] = useState(quiz?.expirationDate || "")
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Simplificar a geração do link público
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const publicLink = `${baseUrl}/quiz-public?id=${quiz?.id || ""}`

  const handleSave = () => {
    if (quiz?.status === "published") {
      setIsConfirmModalOpen(true)
    } else {
      saveSettings()
    }
  }

  const saveSettings = () => {
    const settings = {
      customUrl,
      password: usePassword ? password : "",
      responseLimit: useResponseLimit ? responseLimit : 0,
      expirationDate: useExpiration ? expirationDate : null,
    }

    onSave(quiz.id, settings)
  }

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard
        .writeText(publicLink)
        .then(() => {
          alert("Link copiado para a área de transferência!")
        })
        .catch((err) => {
          console.error("Erro ao copiar link:", err)
          alert("Não foi possível copiar o link. Por favor, tente novamente.")
        })
    }
  }

  // Verificar se o quiz existe antes de renderizar
  if (!quiz) {
    return null
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Publicar Pesquisa</DialogTitle>
            <DialogDescription>Configure as opções de publicação para sua pesquisa "{quiz.name}"</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="share">Compartilhamento</TabsTrigger>
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            </TabsList>

            {/* Tab de Configurações */}
            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-url">URL Personalizada (opcional)</Label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[#e6e6e6] bg-[#f9fafb] text-[#667085] text-sm">
                      {baseUrl}/quiz/
                    </span>
                    <Input
                      id="custom-url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="minha-pesquisa"
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-sm text-[#667085] mt-1">Deixe em branco para usar o ID padrão da pesquisa</p>
                </div>

                <div className="border-t border-[#e6e6e6] pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Label htmlFor="password-toggle" className="text-base">
                          Proteger com senha
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-[#667085] ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Exigir uma senha para acessar a pesquisa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-[#667085]">Os usuários precisarão inserir uma senha para acessar</p>
                    </div>
                    <Switch id="password-toggle" checked={usePassword} onCheckedChange={setUsePassword} />
                  </div>

                  {usePassword && (
                    <div className="mt-3">
                      <Label htmlFor="password">Senha</Label>
                      <div className="flex items-center mt-1">
                        <Lock className="w-4 h-4 text-[#667085] absolute ml-3" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite uma senha"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#e6e6e6] pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Label htmlFor="limit-toggle" className="text-base">
                          Limitar respostas
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-[#667085] ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Definir um número máximo de respostas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-[#667085]">A pesquisa será fechada após atingir o limite</p>
                    </div>
                    <Switch id="limit-toggle" checked={useResponseLimit} onCheckedChange={setUseResponseLimit} />
                  </div>

                  {useResponseLimit && (
                    <div className="mt-3">
                      <Label htmlFor="response-limit">Número máximo de respostas</Label>
                      <Input
                        id="response-limit"
                        type="number"
                        min="1"
                        value={responseLimit}
                        onChange={(e) => setResponseLimit(Number.parseInt(e.target.value) || 100)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#e6e6e6] pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Label htmlFor="expiration-toggle" className="text-base">
                          Data de expiração
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-[#667085] ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Definir uma data limite para respostas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-[#667085]">A pesquisa será fechada após esta data</p>
                    </div>
                    <Switch id="expiration-toggle" checked={useExpiration} onCheckedChange={setUseExpiration} />
                  </div>

                  {useExpiration && (
                    <div className="mt-3">
                      <Label htmlFor="expiration-date">Data de expiração</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 text-[#667085] absolute ml-3" />
                        <Input
                          id="expiration-date"
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab de Compartilhamento */}
            <TabsContent value="share" className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="public-link">Link Público</Label>
                  <div className="flex mt-1">
                    <Input id="public-link" value={publicLink} readOnly className="rounded-r-none" />
                    <Button onClick={handleCopyLink} className="rounded-l-none" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="border-t border-[#e6e6e6] pt-4">
                  <h3 className="text-sm font-medium mb-3">Incorporar em seu site</h3>
                  <div className="bg-[#f9fafb] p-3 rounded-md border border-[#e6e6e6]">
                    <code className="text-sm text-[#101828] break-all">
                      {`<iframe src="${publicLink}" width="100%" height="600" frameborder="0"></iframe>`}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      if (typeof navigator !== "undefined") {
                        navigator.clipboard.writeText(
                          `<iframe src="${publicLink}" width="100%" height="600" frameborder="0"></iframe>`,
                        )
                        alert("Código copiado para a área de transferência!")
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab de QR Code - Simplificado */}
            <TabsContent value="qrcode" className="space-y-4 py-4">
              <div className="flex flex-col items-center">
                {/* Renderização condicional simplificada */}
                <div className="h-[200px] w-[200px] flex items-center justify-center">
                  {activeTab === "qrcode" && publicLink ? (
                    <QRCodeGenerator url={publicLink} size={200} />
                  ) : (
                    <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                      Carregando QR Code...
                    </div>
                  )}
                </div>

                <div className="mt-6 w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      try {
                        const canvas = document.querySelector("canvas")
                        if (canvas) {
                          const link = document.createElement("a")
                          link.download = `qrcode-${quiz.name.replace(/\s+/g, "-").toLowerCase()}.png`
                          link.href = canvas.toDataURL("image/png")
                          link.click()
                        } else {
                          alert("Não foi possível gerar o QR Code. Tente novamente.")
                        }
                      } catch (error) {
                        console.error("Erro ao baixar QR Code:", error)
                        alert("Ocorreu um erro ao baixar o QR Code.")
                      }
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Baixar QR Code
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm text-[#667085]">
                  <p>Escaneie o código QR acima para acessar a pesquisa</p>
                  <p className="mt-1">ou compartilhe-o em materiais impressos</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center text-[#667085]">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {quiz.status === "published"
                    ? "Esta pesquisa já está publicada"
                    : "Esta pesquisa ainda não foi publicada"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90">
                  <Globe className="w-4 h-4 mr-2" />
                  {quiz.status === "published" ? "Atualizar publicação" : "Publicar pesquisa"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação - Separado do Dialog principal */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            setIsConfirmModalOpen(false)
            saveSettings()
          }}
          onCancel={() => setIsConfirmModalOpen(false)}
          title="Atualizar publicação"
          message="Tem certeza que deseja atualizar as configurações de publicação desta pesquisa? As alterações serão aplicadas imediatamente."
          confirmText="Atualizar"
          cancelText="Cancelar"
        />
      )}
    </>
  )
}
