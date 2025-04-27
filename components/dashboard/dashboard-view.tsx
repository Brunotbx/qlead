"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  ChevronRight,
  Plus,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Eye,
  MessageSquare,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import QuizList from "./quiz-list"
import PublishModal from "./publish-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DashboardView() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Carregar pesquisas do localStorage
  useEffect(() => {
    loadQuizzes()
  }, [])

  // Aplicar filtros e ordenação
  useEffect(() => {
    filterAndSortQuizzes()
  }, [quizzes, searchTerm, statusFilter, sortBy, sortOrder])

  const loadQuizzes = () => {
    try {
      const savedData = localStorage.getItem("savedQuizzes")
      if (savedData) {
        const loadedQuizzes = JSON.parse(savedData)

        // Adicionar status e estatísticas simuladas para cada pesquisa
        const enhancedQuizzes = loadedQuizzes.map((quiz: any) => {
          // Verificar se já existem respostas para esta pesquisa
          const responsesKey = `quizResponses_${quiz.id}`
          const responsesData = localStorage.getItem(responsesKey)
          const responses = responsesData ? JSON.parse(responsesData) : []

          // Gerar estatísticas simuladas se não existirem
          const views = quiz.views || Math.floor(Math.random() * 100) + responses.length

          return {
            ...quiz,
            status: quiz.status || (Math.random() > 0.3 ? "published" : "draft"),
            views: views,
            responses: responses.length,
            conversionRate: responses.length > 0 ? Math.round((responses.length / views) * 100) : 0,
            publishedUrl: quiz.publishedUrl || "",
            password: quiz.password || "",
            responseLimit: quiz.responseLimit || 0,
            expirationDate: quiz.expirationDate || null,
          }
        })

        setQuizzes(enhancedQuizzes)
      } else {
        setQuizzes([])
      }
    } catch (error) {
      console.error("Erro ao carregar pesquisas:", error)
      setQuizzes([])
    }
  }

  const filterAndSortQuizzes = () => {
    let filtered = [...quizzes]

    // Aplicar filtro de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Aplicar filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter((quiz) => quiz.status === statusFilter)
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case "views":
          comparison = b.views - a.views
          break
        case "responses":
          comparison = b.responses - a.responses
          break
        case "conversion":
          comparison = b.conversionRate - a.conversionRate
          break
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }

      return sortOrder === "asc" ? comparison * -1 : comparison
    })

    setFilteredQuizzes(filtered)
  }

  const handleCreateNewQuiz = () => {
    router.push("/")
  }

  const handleEditQuiz = (quizId: string) => {
    // Salvar o ID da pesquisa atual no localStorage
    localStorage.setItem("currentQuizId", quizId)
    router.push("/")
  }

  const handlePublishQuiz = (quiz: any) => {
    try {
      // Criar uma cópia simples do objeto quiz para evitar problemas de referência circular
      const simplifiedQuiz = {
        id: quiz.id,
        name: quiz.name,
        status: quiz.status,
        publishedUrl: quiz.publishedUrl || "",
        password: quiz.password || "",
        responseLimit: quiz.responseLimit || 0,
        expirationDate: quiz.expirationDate || null,
      }

      setSelectedQuiz(simplifiedQuiz)

      // Importante: definir o estado em uma etapa separada para garantir que o React atualize corretamente
      setTimeout(() => {
        setIsPublishModalOpen(true)
      }, 0)
    } catch (error) {
      console.error("Erro ao abrir modal de publicação:", error)
      alert("Ocorreu um erro ao abrir as opções de publicação. Por favor, tente novamente.")
    }
  }

  const handleSavePublishSettings = (quizId: string, settings: any) => {
    try {
      // Atualizar as configurações de publicação da pesquisa
      const updatedQuizzes = quizzes.map((quiz) => {
        if (quiz.id === quizId) {
          return {
            ...quiz,
            status: "published",
            publishedUrl: settings.customUrl,
            password: settings.password,
            responseLimit: settings.responseLimit,
            expirationDate: settings.expirationDate,
          }
        }
        return quiz
      })

      // Salvar no localStorage
      localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes))

      // Atualizar o estado
      setQuizzes(updatedQuizzes)

      // Fechar o modal e limpar o estado
      setIsPublishModalOpen(false)
      setSelectedQuiz(null)

      // Feedback para o usuário
      alert("Pesquisa publicada com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar configurações de publicação:", error)
      alert("Ocorreu um erro ao salvar as configurações de publicação. Por favor, tente novamente.")
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ "--theme-color": "#ff9811" } as React.CSSProperties}>
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
            <span className="font-medium">Dashboard</span>
          </div>
        </div>

        {/* User info and logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#667085]">
            <span>Olá, {user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1 text-[#667085] hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#101828] mb-1">Gestão de Pesquisas</h1>
              <p className="text-[#667085]">Gerencie e acompanhe todas as suas pesquisas</p>
            </div>
            <Button
              onClick={handleCreateNewQuiz}
              className="mt-4 md:mt-0 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Pesquisa
            </Button>
          </div>

          {/* Tabs, search and filters */}
          <div className="bg-white rounded-lg border border-[#e6e6e6] mb-6">
            <div className="p-4">
              <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value)}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <TabsList className="bg-[#f2f4f7]">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                      Todas
                      <Badge className="ml-2 bg-[#f2f4f7] text-[#344054]">{quizzes.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="published" className="data-[state=active]:bg-white">
                      Publicadas
                      <Badge className="ml-2 bg-[#f2f4f7] text-[#344054]">
                        {quizzes.filter((q) => q.status === "published").length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="draft" className="data-[state=active]:bg-white">
                      Rascunhos
                      <Badge className="ml-2 bg-[#f2f4f7] text-[#344054]">
                        {quizzes.filter((q) => q.status === "draft").length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex w-full sm:w-auto gap-2">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085] w-4 h-4" />
                      <Input
                        placeholder="Buscar pesquisas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSortBy("date")}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Ordenar por data</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("name")}>
                                <span className="mr-2">Aa</span>
                                <span>Ordenar por nome</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("views")}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ordenar por visualizações</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("responses")}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Ordenar por respostas</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filtrar e ordenar</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{sortOrder === "asc" ? "Ordem crescente" : "Ordem decrescente"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <TabsContent value="all" className="m-0">
                  <QuizList
                    quizzes={filteredQuizzes}
                    onEdit={handleEditQuiz}
                    onPublish={handlePublishQuiz}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="published" className="m-0">
                  <QuizList
                    quizzes={filteredQuizzes}
                    onEdit={handleEditQuiz}
                    onPublish={handlePublishQuiz}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="draft" className="m-0">
                  <QuizList
                    quizzes={filteredQuizzes}
                    onEdit={handleEditQuiz}
                    onPublish={handlePublishQuiz}
                    formatDate={formatDate}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal - Renderização condicional simplificada */}
      {isPublishModalOpen && selectedQuiz ? (
        <PublishModal
          quiz={selectedQuiz}
          onClose={() => {
            setIsPublishModalOpen(false)
            // Importante: limpar o selectedQuiz após fechar o modal
            setTimeout(() => setSelectedQuiz(null), 100)
          }}
          onSave={handleSavePublishSettings}
        />
      ) : null}
    </div>
  )
}
