import { create } from "zustand"
import { persist } from "zustand/middleware"

// Atualizar o tipo ComponentType para remover "final-screen"
export type ComponentType = "multiple-choice" | "image" | "video" | "text" | "long-text"

export interface QuestionInput {
  id: string
  type: "text" | "email" | "phone"
  placeholder: string
  required: boolean
  mask?: string
  iconType?: string
  label?: string
}

export interface QuestionOption {
  id: string
  text: string
  icon: string
}

export type ImageElementType = "image" | "title" | "cta" | "input"

export interface ImageElement {
  id: string
  type: ImageElementType
}

// Adicionar a nova opção de formato de vídeo na interface Question
export interface Question {
  id: string
  title: string
  subtitle?: string
  componentType: ComponentType
  inputs: QuestionInput[]
  videoDescription?: string
  youtubeUrl?: string
  options?: QuestionOption[]
  icon?: string
  longTextValue?: string
  imageUrl?: string | null
  imageElements?: ImageElement[]
  config: {
    required: boolean
    showTitles: boolean
    maxChars: boolean
    maxCharsValue: string
    showIcon: boolean
    iconPosition?: "left" | "center" | "right"
    videoPosition?: "top" | "bottom"
    videoSize?: "small" | "large" | "full"
    videoFormat?: "landscape" | "portrait" // Novo campo para formato do vídeo
    imagePosition?: "top"
    showImageInput?: boolean
    showImageCta?: boolean
    ctaFullWidth?: boolean
    ctaRounded?: boolean
    imageCta?: {
      text: string
      link: string
    }
    multipleSelection?: boolean
    otherOption?: boolean
    hideDescription?: boolean
    centerDescription?: boolean
    centerContent?: boolean
    showButton?: boolean
    buttonText?: string
    buttonRounded?: boolean
    buttonShowIcon?: boolean
    buttonRedirect?: boolean
    buttonLink?: string
    buttonTimer?: number
    showImage?: boolean
    showFinalCta?: boolean
    finalCtaText?: string
    finalCtaLink?: string
    finalCtaFullWidth?: boolean
  }
}

// Interface para pesquisas salvas
export interface SavedQuiz {
  id: string
  name: string
  description?: string
  createdAt: string
  questions: Question[]
  themeColor: string
  customLogo: string | null
  viewMode: "desktop" | "mobile"
  buttonRounded: boolean
  buttonStyle: "primary" | "secondary" // Add this line
}

// Adicionar o estado para botões arredondados no store
interface QuizState {
  questions: Question[]
  activeQuestionId: string | null
  viewMode: "desktop" | "mobile"
  themeColor: string
  customLogo: string | null
  currentQuizId: string | null
  buttonRounded: boolean
  buttonStyle: "primary" | "secondary" // Add this line
  addQuestion: (componentType: ComponentType) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  removeQuestion: (id: string) => void
  setActiveQuestion: (id: string | null) => void
  addInputToQuestion: (questionId: string, type: "text" | "email" | "phone") => void
  removeInputFromQuestion: (questionId: string, inputId: string) => void
  moveQuestion: (fromIndex: number, toIndex: number) => void
  reorderInputs: (questionId: string, fromIndex: number, toIndex: number) => void
  reorderImageElements: (questionId: string, fromIndex: number, toIndex: number) => void
  setViewMode: (mode: "desktop" | "mobile") => void
  addComponentToActiveQuestion: (componentType: ComponentType) => void
  updateInputMask: (questionId: string, inputId: string, mask: string) => void
  updateInputIconType: (questionId: string, inputId: string, iconType: string) => void
  setThemeColor: (color: string) => void
  previewThemeColor: string
  setPreviewThemeColor: (color: string) => void
  updateQuestionIcon: (id: string, iconUrl: string) => void
  setCustomLogo: (logoUrl: string | null) => void
  setButtonRounded: (rounded: boolean) => void
  setButtonStyle: (style: "primary" | "secondary") => void // Add this line
  updateLocalStorage: () => void
  loadSavedQuiz: (quizId: string) => void
  resetQuiz: () => void
}

// Manter o viewMode como "desktop" por padrão
export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: [],
      activeQuestionId: null,
      viewMode: "desktop", // Mantido como "desktop" por padrão
      themeColor: "#ff9811",
      // Add implementation for previewThemeColor to separate it from the main UI theme
      previewThemeColor: "#ff9811",
      customLogo: null,
      currentQuizId: null,
      buttonRounded: false, // Adicionar o estado inicial
      buttonStyle: "primary", // Add this line with default value

      // Add the setter function for buttonStyle
      setButtonStyle: (style) => {
        set({ buttonStyle: style })

        // Update the localStorage after modifying the configuration
        get().updateLocalStorage()
      },

      // Adicionar a função para atualizar o estado de botões arredondados
      setButtonRounded: (rounded) => {
        set({ buttonRounded: rounded })

        // Atualizar o localStorage após modificar a configuração
        get().updateLocalStorage()
      },

      addQuestion: (componentType) => {
        const newQuestion: Question = {
          id: Date.now().toString(),
          title: "Escreva aqui o título da sua questão",
          subtitle: "Subtítulo da questão (opcional)",
          componentType,
          inputs: [],
          config: {
            required: false,
            showTitles: true,
            maxChars: true,
            maxCharsValue: "0 - 50",
            showIcon: false,
            iconPosition: "center",
            showButton: true,
            buttonText: "Continuar",
            buttonRounded: false,
            buttonShowIcon: true,
            buttonRedirect: false,
            centerContent: false,
            showImageInput: false, // Default to false for the text input
            ctaFullWidth: true, // Default to full width for CTA button
            ctaRounded: false,
          },
        }

        // Inicializar opções para múltipla escolha
        if (componentType === "multiple-choice") {
          newQuestion.options = [
            { id: "1", text: "Opção 1", icon: "smile" },
            { id: "2", text: "Opção 2", icon: "smile" },
            { id: "3", text: "Opção 3", icon: "smile" },
            { id: "4", text: "Opção 4", icon: "smile" },
          ]
        }

        // Inicializar elementos para o componente de imagem
        if (componentType === "image") {
          newQuestion.imageElements = [
            { id: "1", type: "image" },
            { id: "2", type: "title" },
            { id: "3", type: "cta" },
            { id: "4", type: "input" },
          ]
        }

        // Inicializar configurações específicas para a tela final
        if (componentType === "final-screen") {
          newQuestion.title = "Obrigado por participar!"
          newQuestion.subtitle = "Sua resposta foi registrada com sucesso."
          newQuestion.config = {
            ...newQuestion.config,
            showTitles: true,
            showImage: true,
            showFinalCta: true,
            finalCtaText: "Visite nosso site",
            finalCtaLink: "#",
            finalCtaFullWidth: true,
          }
        }

        // Quando adicionar a primeira questão, mudar para o modo mobile
        const { questions } = get()
        const newViewMode = questions.length === 0 ? "mobile" : get().viewMode

        set((state) => ({
          questions: [...state.questions, newQuestion],
          activeQuestionId: newQuestion.id,
          viewMode: newViewMode, // Muda para mobile apenas quando adiciona a primeira questão
        }))

        // Atualizar localStorage após adicionar questão
        get().updateLocalStorage()
      },

      updateQuestion: (id, updates) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }))

        // Atualizar localStorage após modificar questão
        get().updateLocalStorage()
      },

      removeQuestion: (id) => {
        const { questions, activeQuestionId } = get()
        const newQuestions = questions.filter((q) => q.id !== id)

        set({
          questions: newQuestions,
          activeQuestionId:
            activeQuestionId === id ? (newQuestions.length > 0 ? newQuestions[0].id : null) : activeQuestionId,
        })

        // Atualizar localStorage após remover questão
        get().updateLocalStorage()
      },

      setActiveQuestion: (id) => {
        set({ activeQuestionId: id })
      },

      // Modificar a função addInputToQuestion para garantir que novos campos sempre sejam do tipo texto
      addInputToQuestion: (questionId, type) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              // Sempre usar tipo texto como padrão
              const inputType = "text"

              // Usar o placeholder padrão
              const placeholder = "Insira sua pergunta aqui"

              return {
                ...q,
                inputs: [
                  ...q.inputs,
                  {
                    id: Date.now().toString(),
                    type: inputType,
                    placeholder: placeholder,
                    required: false,
                    iconType: inputType,
                    label: "",
                  },
                ],
              }
            }
            return q
          }),
        }))
      },

      removeInputFromQuestion: (questionId, inputId) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                inputs: q.inputs.filter((input) => input.id !== inputId),
              }
            }
            return q
          }),
        }))
      },

      moveQuestion: (fromIndex, toIndex) => {
        set((state) => {
          const newQuestions = [...state.questions]
          const [movedQuestion] = newQuestions.splice(fromIndex, 1)
          newQuestions.splice(toIndex, 0, movedQuestion)
          return { questions: newQuestions }
        })
      },

      reorderInputs: (questionId, fromIndex, toIndex) => {
        set((state) => {
          const newQuestions = state.questions.map((q) => {
            if (q.id === questionId) {
              const newInputs = [...q.inputs]
              const [movedInput] = newInputs.splice(fromIndex, 1)
              newInputs.splice(toIndex, 0, movedInput)
              return { ...q, inputs: newInputs }
            }
            return q
          })
          return { questions: newQuestions }
        })
      },

      reorderImageElements: (questionId, fromIndex, toIndex) => {
        set((state) => {
          const newQuestions = state.questions.map((q) => {
            if (q.id === questionId && q.imageElements) {
              const newElements = [...q.imageElements]
              const [movedElement] = newElements.splice(fromIndex, 1)
              newElements.splice(toIndex, 0, movedElement)
              return { ...q, imageElements: newElements }
            }
            return q
          })
          return { questions: newQuestions }
        })
      },

      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      addComponentToActiveQuestion: (componentType) => {
        const { activeQuestionId } = get()

        if (activeQuestionId) {
          set((state) => ({
            questions: state.questions.map((q) => {
              if (q.id === activeQuestionId) {
                // Inicializar opções para múltipla escolha
                const updates: Partial<Question> = { componentType }

                if (componentType === "multiple-choice") {
                  updates.options = [
                    { id: "1", text: "Opção 1", icon: "smile" },
                    { id: "2", text: "Opção 2", icon: "smile" },
                    { id: "3", text: "Opção 3", icon: "smile" },
                    { id: "4", text: "Opção 4", icon: "smile" },
                  ]
                  updates.config = {
                    ...q.config,
                    centerContent: false,
                  }
                }

                // Inicializar elementos para o componente de imagem
                if (componentType === "image") {
                  updates.imageElements = [
                    { id: "1", type: "image" },
                    { id: "2", type: "title" },
                    { id: "3", type: "cta" },
                    { id: "4", type: "input" },
                  ]
                }

                // Inicializar configurações específicas para a tela final
                if (componentType === "final-screen") {
                  updates.title = "Obrigado por participar!"
                  updates.subtitle = "Sua resposta foi registrada com sucesso."
                  updates.config = {
                    ...q.config,
                    showTitles: true,
                    showImage: true,
                    showFinalCta: true,
                    finalCtaText: "Visite nosso site",
                    finalCtaLink: "#",
                    finalCtaFullWidth: true,
                  }
                }

                return {
                  ...q,
                  ...updates,
                }
              }
              return q
            }),
          }))
        } else {
          // Se não houver questão ativa, cria uma nova
          get().addQuestion(componentType)
        }
      },

      // Modificar a função updateInputMask para garantir que o tipo "email" seja definido corretamente
      // Localizar a função updateInputMask e substituir por esta versão:

      updateInputMask: (questionId, inputId, mask) => {
        set((state) => {
          const updatedQuestions = state.questions.map((q) => {
            if (q.id === questionId) {
              const updatedInputs = q.inputs.map((input) => {
                if (input.id === inputId) {
                  // Determinar o tipo e a máscara com base na seleção
                  let updatedType = "text"
                  let updatedMask = ""
                  let updatedPlaceholder = input.placeholder || "Insira sua resposta aqui"

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

                  return {
                    ...input,
                    type: updatedType,
                    mask: updatedMask,
                    placeholder: updatedPlaceholder,
                  }
                }
                return input
              })

              return {
                ...q,
                inputs: updatedInputs,
              }
            }
            return q
          })

          return { questions: updatedQuestions }
        })

        // Atualizar localStorage após modificar o input
        setTimeout(() => {
          get().updateLocalStorage()
        }, 0)
      },

      updateInputIconType: (questionId, inputId, iconType) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                inputs: q.inputs.map((input) => {
                  if (input.id === inputId) {
                    return {
                      ...input,
                      iconType,
                    }
                  }
                  return input
                }),
              }
            }
            return q
          }),
        }))
      },

      setThemeColor: (color) => {
        set({ themeColor: color })
      },

      setPreviewThemeColor: (color) => {
        set({ previewThemeColor: color })

        // Atualizar a variável CSS quando a cor for alterada
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--theme-color", color)
        }

        // Atualizar localStorage após modificar a cor
        get().updateLocalStorage()
      },

      updateQuestionIcon: (id, iconUrl) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, icon: iconUrl } : q)),
        }))
      },

      setCustomLogo: (logoUrl) => {
        set({ customLogo: logoUrl })
      },

      // Adicionar um efeito para atualizar o localStorage quando houver mudanças nas questões
      // Adicionar dentro do objeto de estado do store, após a definição das funções existentes
      updateLocalStorage: () => {
        const state = get()
        localStorage.setItem(
          "quizPreviewData",
          JSON.stringify({
            questions: state.questions,
            currentIndex: 0,
            previewThemeColor: state.previewThemeColor,
            customLogo: state.customLogo,
            viewMode: state.viewMode,
            buttonRounded: state.buttonRounded,
            buttonStyle: state.buttonStyle,
            timestamp: Date.now(),
            quizId: state.currentQuizId || null,
          }),
        )
      },

      // Função para carregar uma pesquisa salva
      loadSavedQuiz: (quizId) => {
        try {
          const savedQuizzes = localStorage.getItem("savedQuizzes")
          if (savedQuizzes) {
            const quizzes: SavedQuiz[] = JSON.parse(savedQuizzes)
            const quiz = quizzes.find((q) => q.id === quizId)

            if (quiz && quiz.questions && quiz.questions.length > 0) {
              set({
                questions: quiz.questions,
                themeColor: quiz.themeColor,
                previewThemeColor: quiz.themeColor, // Usar a cor do tema salva na pesquisa
                customLogo: quiz.customLogo,
                viewMode: quiz.viewMode,
                buttonRounded: quiz.buttonRounded || false,
                buttonStyle: quiz.buttonStyle || "primary",
                activeQuestionId: quiz.questions.length > 0 ? quiz.questions[0].id : null,
                currentQuizId: quizId,
              })

              // Store current quiz ID in localStorage
              localStorage.setItem("currentQuizId", quizId)

              // Atualizar o localStorage com a pesquisa carregada
              get().updateLocalStorage()

              // Atualizar a variável CSS quando a pesquisa for carregada
              if (typeof document !== "undefined") {
                document.documentElement.style.setProperty("--theme-color", quiz.themeColor)
              }

              console.log("Pesquisa carregada com sucesso. Número de questões:", quiz.questions.length)
            } else {
              console.error("A pesquisa não contém questões ou está corrompida")
              if (typeof window !== "undefined") {
                alert("Esta pesquisa não contém questões ou está corrompida. Por favor, crie uma nova pesquisa.")
              }
            }
          }
        } catch (error) {
          console.error("Erro ao carregar pesquisa:", error)
          if (typeof window !== "undefined") {
            alert("Ocorreu um erro ao carregar a pesquisa. Por favor, tente novamente.")
          }
        }
      },

      // Nova função para resetar o estado do quiz
      resetQuiz: () => {
        // Limpar o ID do quiz atual no localStorage
        localStorage.removeItem("currentQuizId")

        // Resetar o estado para os valores iniciais
        set({
          questions: [],
          activeQuestionId: null,
          viewMode: "desktop",
          themeColor: "#ff9811",
          previewThemeColor: "#ff9811",
          customLogo: null,
          currentQuizId: null,
          buttonRounded: false,
          buttonStyle: "primary",
        })

        // Limpar os dados de preview
        localStorage.removeItem("quizPreviewData")

        // Atualizar a variável CSS para a cor padrão
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--theme-color", "#ff9811")
        }
      },
    }),
    {
      name: "quiz-storage",
    },
  ),
)
