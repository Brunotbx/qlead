import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ComponentType = "multiple-choice" | "image" | "video" | "text" | "long-text"

export interface QuestionInput {
  id: string
  type: "text" | "email" | "phone"
  placeholder: string
  required: boolean
  mask?: string
  iconType?: string
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
  }
}

// Manter o viewMode como "desktop" por padrão
interface QuizState {
  questions: Question[]
  activeQuestionId: string | null
  viewMode: "desktop" | "mobile"
  themeColor: string
  customLogo: string | null
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
}

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

        // Quando adicionar a primeira questão, mudar para o modo mobile
        const { questions } = get()
        const newViewMode = questions.length === 0 ? "mobile" : get().viewMode

        set((state) => ({
          questions: [...state.questions, newQuestion],
          activeQuestionId: newQuestion.id,
          viewMode: newViewMode, // Muda para mobile apenas quando adiciona a primeira questão
        }))
      },

      updateQuestion: (id, updates) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }))
      },

      removeQuestion: (id) => {
        const { questions, activeQuestionId } = get()
        const newQuestions = questions.filter((q) => q.id !== id)

        set({
          questions: newQuestions,
          activeQuestionId:
            activeQuestionId === id ? (newQuestions.length > 0 ? newQuestions[0].id : null) : activeQuestionId,
        })
      },

      setActiveQuestion: (id) => {
        set({ activeQuestionId: id })
      },

      addInputToQuestion: (questionId, type) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                inputs: [
                  ...q.inputs,
                  {
                    id: Date.now().toString(),
                    type,
                    placeholder: "Insira sua pergunta aqui",
                    required: false,
                    iconType: type,
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

      updateInputMask: (questionId, inputId, mask) => {
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                inputs: q.inputs.map((input) => {
                  if (input.id === inputId) {
                    return {
                      ...input,
                      mask,
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
      },

      updateQuestionIcon: (id, iconUrl) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, icon: iconUrl } : q)),
        }))
      },

      setCustomLogo: (logoUrl) => {
        set({ customLogo: logoUrl })
      },
    }),
    {
      name: "quiz-storage",
    },
  ),
)
