"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  BarChart2,
  Clock,
  Users,
  ExternalLink,
  Download,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import ConfirmationModal from "@/components/confirmation-modal"
import QuizQuestionPreview from "@/components/quiz-question-preview"
import type { SavedQuiz } from "@/lib/store"
import QuizResponsesChart from "./quiz-responses-chart"
import QuizResponsesList from "./quiz-responses-list"

interface QuizDetailsViewProps {
  quizId: string
}

export default function QuizDetailsView({ quizId }: QuizDetailsViewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Carregar dados da pesquisa e respostas
  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoading(true)
      try {
        // Simular um pequeno atraso para mostrar o esqueleto de carregamento
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Carregar dados da pesquisa
        const savedQuizzes = localStorage.getItem("savedQuizzes")
        if (savedQuizzes) {
          const quizzes = JSON.parse(savedQuizzes)
          const foundQuiz = quizzes.find((q: SavedQuiz) => q.id === quizId)

          if (foundQuiz) {
            setQuiz(foundQuiz)

            // Carregar respostas
            const responsesKey = `quizResponses_${quizId}`
            const responsesData = localStorage.getItem(responsesKey)
            if (responsesData) {
              const parsedResponses = JSON.parse(responsesData)
              setResponses(parsedResponses)
            } else {
              setResponses([])
            }
          } else {
            toast({
              variant: "destructive",
              title: "Pesquisa não encontrada",
              description: "A pesquisa solicitada não foi encontrada.",
            })
            router.push("/dashboard")
          }
        } else {
          toast({
            variant: "destructive",
            title: "Pesquisa não encontrada",
            description: "Não foi possível carregar os dados da pesquisa.",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Erro ao carregar dados da pesquisa:", error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados da pesquisa.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizData()
  }, [quizId, router, toast])

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!quiz || !responses.length) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageTimeSeconds: 0,
        responsesByQuestion: [],
      }
    }

    // Calcular taxa de conclusão (respostas completas / visualizações)
    const views = quiz.views || responses.length * 2 // Estimativa se não houver dados reais
    const completionRate = Math.round((responses.length / views) * 100)

    // Calcular tempo médio (simulado)
    const averageTimeSeconds = Math.floor(Math.random() * 120) + 60 // Entre 60 e 180 segundos

    // Calcular respostas por questão
    const responsesByQuestion = quiz.questions.map((question) => {
      const questionResponses = responses.filter(
        (r) => r.answers && r.answers.some((a: any) => a.questionId === question.id),
      )

      return {
        questionId: question.id,
        questionTitle: question.title,
        responseCount: questionResponses.length,
        completionPercentage: Math.round((questionResponses.length / responses.length) * 100),
      }
    })

    return {
      totalResponses: responses.length,
      completionRate,
      averageTimeSeconds,
      responsesByQuestion,
    }
  }, [quiz, responses])

  const handleEditQuiz = () => {
    // Salvar o ID da pesquisa atual no localStorage
    localStorage.setItem("currentQuizId", quizId)
    router.push("/")
  }

  const handleDuplicateQuiz = () => {
    if (!quiz) return

    try {
      // Obter pesquisas atuais
      const savedQuizzes = localStorage.getItem("savedQuizzes")
      if (savedQuizzes) {
        const quizzes = JSON.parse(savedQuizzes)

        // Criar uma cópia da pesquisa com um novo ID
        const duplicatedQuiz = {
          ...quiz,
          id: Date.now().toString(),
          name: `${quiz.name} (cópia)`,
          createdAt: new Date().toISOString(),
        }

        // Adicionar a pesquisa duplicada
        quizzes.push(duplicatedQuiz)

        // Salvar as pesquisas atualizadas
        localStorage.setItem("savedQuizzes", JSON.stringify(quizzes))

        toast({
          variant: "success",
          title: "Pesquisa duplicada",
          description: "A pesquisa foi duplicada com sucesso.",
        })

        // Redirecionar para a página de detalhes da pesquisa duplicada
        router.push(`/dashboard/${duplicatedQuiz.id}`)
      }
    } catch (error) {
      console.error("Erro ao duplicar pesquisa:", error)
      toast({
        variant: "destructive",
        title: "Erro ao duplicar",
        description: "Não foi possível duplicar a pesquisa. Por favor, tente novamente.",
      })
    }
  }

  const handleDeleteQuiz = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteQuiz = () => {
    try {
      // Obter pesquisas atuais
      const savedQuizzes = localStorage.getItem("savedQuizzes")
      if (savedQuizzes) {
        const quizzes = JSON.parse(savedQuizzes)

        // Filtrar a pesquisa a ser excluída
        const updatedQuizzes = quizzes.filter((q: SavedQuiz) => q.id !== quizId)

        // Salvar as pesquisas atualizadas
        localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes))

        toast({
          variant: "success",
          title: "Pesquisa excluída",
          description: "A pesquisa foi excluída com sucesso.",
        })

        // Redirecionar para o dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erro ao excluir pesquisa:", error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir a pesquisa. Por favor, tente novamente.",
      })
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const handleOpenPublicView = () => {
    if (!quiz) return

    try {
      // Limpar quaisquer dados de preview anteriores
      localStorage.removeItem("quizPreviewData")

      // Criar um objeto simplificado para a visualização pública
      const previewData = {
        questions: quiz.questions.map((q) => ({
          ...q,
          ref: undefined,
          handlers: undefined,
        })),
        currentIndex: 0,
        previewThemeColor: quiz.themeColor || "#ff9811",
        customLogo: quiz.customLogo,
        viewMode: quiz.viewMode || "mobile",
        buttonRounded: quiz.buttonRounded || false,
        buttonStyle: quiz.buttonStyle || "primary",
        timestamp: Date.now(),
        quizId: quizId,
      }

      // Salvar os dados no localStorage
      localStorage.setItem("quizPreviewData", JSON.stringify(previewData))

      // Garantir que a cor do tema seja aplicada na visualização pública
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--theme-color", quiz.themeColor || "#ff9811")
      }

      // Abrir em uma nova aba
      window.open("/quiz-public", "_blank")
    } catch (error) {
      console.error("Erro ao abrir visualização pública:", error)
      toast({
        variant: "destructive",
        title: "Erro ao abrir visualização",
        description: "Ocorreu um erro ao abrir a visualização pública.",
      })
    }
  }

  const handleExportResponses = () => {
    if (!quiz || !responses.length) {
      toast({
        variant: "destructive",
        title: "Sem dados para exportar",
        description: "Não há respostas para exportar.",
      })
      return
    }

    try {
      // Preparar dados para exportação
      const exportData = {
        quizName: quiz.name,
        quizId: quiz.id,
        exportDate: new Date().toISOString(),
        totalResponses: responses.length,
        responses: responses.map((response) => {
          // Formatar as respostas para melhor legibilidade
          const formattedAnswers = response.answers.map((answer: any) => {
            const question = quiz.questions.find((q) => q.id === answer.questionId)
            return {
              question: question ? question.title : "Questão não encontrada",
              answer: answer.value,
              timestamp: answer.timestamp,
            }
          })

          return {
            responseId: response.id,
            submittedAt: response.submittedAt,
            answers: formattedAnswers,
          }
        }),
      }

      // Converter para JSON
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      // Criar link de download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `respostas_${quiz.name.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        variant: "success",
        title: "Dados exportados",
        description: "As respostas foram exportadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar respostas:", error)
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar as respostas.",
      })
    }
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen" style={{ "--theme-color": "#ff9811" } as React.CSSProperties}>
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl">
              <span className="text-black">quiz</span>
              <span className="text-[var(--theme-color)]">lead</span>
            </div>
            <div className="flex items-center text-sm text-[#667085]">
              <Home className="w-4 h-4 mr-1" />
              <ChevronRight className="w-3 h-3 mx-1" />
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span>Carregando...</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar mensagem se a pesquisa não for encontrada
  if (!quiz) {
    return (
      <div className="flex flex-col h-screen" style={{ "--theme-color": "#ff9811" } as React.CSSProperties}>
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl">
              <span className="text-black">quiz</span>
              <span className="text-[var(--theme-color)]">lead</span>
            </div>
            <div className="flex items-center text-sm text-[#667085]">
              <Home className="w-4 h-4 mr-1" />
              <ChevronRight className="w-3 h-3 mx-1" />
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span>Pesquisa não encontrada</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Pesquisa não encontrada</h2>
            <p className="text-[#667085] mb-6">A pesquisa solicitada não foi encontrada ou foi excluída.</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{ "--theme-color": quiz.themeColor || "#ff9811" } as React.CSSProperties}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6]">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl">
            <span className="text-black">quiz</span>
            <span className="text-[var(--theme-color)]">lead</span>
          </div>
          <div className="flex items-center text-sm text-[#667085]">
            <Home className="w-4 h-4 mr-1" />
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="cursor-pointer hover:underline" onClick={() => router.push("/dashboard")}>
              Dashboard
            </span>
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="font-medium text-[var(--theme-color)]">{quiz.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Quiz header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#101828]">{quiz.name}</h1>
                <Badge
                  variant="outline"
                  className={`${
                    quiz.status === "published"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {quiz.status === "published" ? "Publicada" : "Rascunho"}
                </Badge>
              </div>
              {quiz.description && <p className="text-[#667085] mt-1">{quiz.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm text-[#667085]">
                <span>Criada em: {formatDate(quiz.createdAt)}</span>
                {quiz.updatedAt && <span>Última atualização: {formatDate(quiz.updatedAt)}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={handleOpenPublicView}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Testar Pesquisa
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicateQuiz}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditQuiz}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={handleDeleteQuiz}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#667085]">Total de Respostas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-[var(--theme-color)] mr-2" />
                  <span className="text-2xl font-bold">{stats.totalResponses}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#667085]">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart2 className="w-5 h-5 text-[var(--theme-color)] mr-2" />
                  <span className="text-2xl font-bold">{stats.completionRate}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#667085]">Tempo Médio de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-[var(--theme-color)] mr-2" />
                  <span className="text-2xl font-bold">
                    {Math.floor(stats.averageTimeSeconds / 60)}:
                    {(stats.averageTimeSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-[#f2f4f7]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:bg-white">
                Questões
              </TabsTrigger>
              <TabsTrigger value="responses" className="data-[state=active]:bg-white">
                Respostas
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Respostas</CardTitle>
                    <CardDescription>Visualização das respostas por questão</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <QuizResponsesChart
                      responsesByQuestion={stats.responsesByQuestion}
                      themeColor={quiz.themeColor || "#ff9811"}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Pesquisa</CardTitle>
                    <CardDescription>Detalhes e configurações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-[#667085]">Configurações</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>Tema:</div>
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: quiz.themeColor || "#ff9811" }}
                            ></div>
                            {quiz.themeColor || "#ff9811"}
                          </div>
                          <div>Visualização:</div>
                          <div>{quiz.viewMode === "mobile" ? "Mobile" : "Desktop"}</div>
                          <div>Botões arredondados:</div>
                          <div>{quiz.buttonRounded ? "Sim" : "Não"}</div>
                          <div>Estilo de botão:</div>
                          <div>{quiz.buttonStyle === "primary" ? "Primário" : "Secundário"}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#667085]">Estatísticas</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>Total de questões:</div>
                          <div>{quiz.questions.length}</div>
                          <div>Visualizações:</div>
                          <div>{quiz.views || stats.totalResponses * 2}</div>
                          <div>Taxa de conversão:</div>
                          <div>{stats.completionRate}%</div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportResponses}
                          disabled={!responses.length}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Respostas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questões da Pesquisa</CardTitle>
                  <CardDescription>Visualização de todas as questões e configurações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {quiz.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-[#f9fafb] px-4 py-3 border-b flex justify-between items-center">
                          <div className="font-medium">Questão {index + 1}</div>
                          <Badge variant="outline" className="bg-[#f2f4f7]">
                            {question.componentType === "text" && "Texto"}
                            {question.componentType === "multiple-choice" && "Múltipla Escolha"}
                            {question.componentType === "image" && "Imagem"}
                            {question.componentType === "video" && "Vídeo"}
                            {question.componentType === "long-text" && "Texto Longo"}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="mb-4">
                            <h3 className="font-medium mb-1">{question.title}</h3>
                            {question.subtitle && <p className="text-sm text-[#667085]">{question.subtitle}</p>}
                          </div>

                          <div className="bg-[#f9fafb] p-4 rounded-lg">
                            <div className="w-full max-w-md mx-auto">
                              <QuizQuestionPreview
                                question={question}
                                viewMode="mobile"
                                themeColor={quiz.themeColor || "#ff9811"}
                                buttonRounded={quiz.buttonRounded}
                                buttonStyle={quiz.buttonStyle}
                                isPreview={true}
                              />
                            </div>
                          </div>

                          {stats.responsesByQuestion.length > 0 && (
                            <div className="mt-4 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[#667085]">
                                  Respostas: {stats.responsesByQuestion[index]?.responseCount || 0}
                                </span>
                                <span className="text-[#667085]">
                                  Taxa de conclusão: {stats.responsesByQuestion[index]?.completionPercentage || 0}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Responses Tab */}
            <TabsContent value="responses" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Respostas Recebidas</CardTitle>
                    <CardDescription>Lista de todas as respostas enviadas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportResponses} disabled={!responses.length}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Respostas
                  </Button>
                </CardHeader>
                <CardContent>
                  {responses.length > 0 ? (
                    <QuizResponsesList responses={responses} questions={quiz.questions} formatDate={formatDate} />
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma resposta ainda</h3>
                      <p className="text-[#667085]">Esta pesquisa ainda não recebeu nenhuma resposta.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteQuiz}
          onCancel={() => setIsDeleteModalOpen(false)}
          title="Excluir pesquisa"
          message="Tem certeza que deseja excluir esta pesquisa? Esta ação não pode ser desfeita e todas as respostas serão perdidas."
          confirmText="Excluir"
          cancelText="Cancelar"
          destructive={true}
        />
      )}
    </div>
  )
}
