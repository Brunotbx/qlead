import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuizStore, type Question } from "@/lib/store"

type Answer = {
  questionId: string
  value: string | string[] | null
  componentType: string
}

export default function SummaryView({
  answers,
  questions,
  previewThemeColor,
}: {
  answers: Answer[]
  questions: Question[]
  previewThemeColor?: string
}) {
  const { previewThemeColor: storeThemeColor, buttonRounded, buttonStyle } = useQuizStore()
  const themeColor = previewThemeColor || storeThemeColor

  // Find the final screen question if it exists
  const finalScreen = questions.find((q) => q.componentType === "final-screen")

  if (finalScreen) {
    return (
      <div className="h-full flex flex-col">
        {/* Full-width image at the top */}
        <div className="w-full">
          {finalScreen.imageUrl ? (
            <img
              src={finalScreen.imageUrl || "/placeholder.svg"}
              alt="Background"
              className="w-full object-cover rounded-md"
              style={{ height: "240px" }}
            />
          ) : (
            <div
              className="w-full bg-purple-600 flex items-center justify-center rounded-md"
              style={{ height: "240px" }}
            >
              <p className="text-white text-lg">Adicione uma imagem aqui</p>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 flex flex-col items-center px-6 py-4 text-center">
          {/* Title with highlight */}
          <div className="mb-2">
            <h2 className="text-xl font-bold">
              {finalScreen.title.split("+").map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part} <span className="text-purple-600 font-bold">+</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 mb-6">{finalScreen.subtitle}</p>

          {/* CTA Button */}
          {finalScreen.config.showFinalCta && (
            <div className="mt-auto w-full">
              <Button
                className="w-full py-4 text-white font-bold text-lg"
                style={{
                  backgroundColor: themeColor,
                  borderRadius: buttonRounded ? "9999px" : "0.375rem",
                }}
              >
                {finalScreen.config.finalCtaText || "COMEÇAR"}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default summary view if no final screen is found
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pesquisa Concluída!</h2>
        <p className="text-[#667085]">Obrigado por completar nossa pesquisa.</p>
      </div>

      <div className="border border-[#e6e6e6] rounded-lg p-4">
        <h3 className="font-medium text-lg mb-4">Resumo das Respostas</h3>

        <div className="space-y-4">
          {answers.map((answer, index) => {
            const question = questions.find((q) => q.id === answer.questionId)
            if (!question) return null

            return (
              <div key={answer.questionId} className="border-b border-[#e6e6e6] pb-4 last:border-0">
                <p className="font-medium">
                  {index + 1}. {question.title}
                </p>

                {answer.componentType === "multiple-choice" && (
                  <div className="mt-2">
                    {Array.isArray(answer.value) && answer.value.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {answer.value.map((optionId, i) => {
                          const option = question.options?.find((opt) => opt.id === optionId)
                          return (
                            <li key={i} className="text-[#667085]">
                              {option?.text || optionId}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-[#667085] italic">Sem resposta</p>
                    )}
                  </div>
                )}

                {answer.componentType === "text" && (
                  <div className="mt-2">
                    {answer.value && typeof answer.value === "string" && answer.value.startsWith("{") ? (
                      <div className="space-y-1">
                        {Object.entries(JSON.parse(answer.value)).map(([inputId, value], i) => {
                          const input = question.inputs.find((inp) => inp.id === inputId)
                          return (
                            <p key={i} className="text-[#667085]">
                              <span className="font-medium">{input?.placeholder || `Campo ${i + 1}`}:</span>{" "}
                              {(value as string) || "Sem resposta"}
                            </p>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[#667085]">{answer.value || "Sem resposta"}</p>
                    )}
                  </div>
                )}

                {(answer.componentType === "long-text" ||
                  answer.componentType === "image" ||
                  answer.componentType === "video") && (
                  <div className="mt-2">
                    <p className="text-[#667085]">{answer.value || "Sem resposta"}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-[#f9fafb] rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">Log de Dados</h4>
        <pre className="whitespace-pre-wrap text-xs text-[#667085] overflow-auto max-h-[200px]">
          {JSON.stringify(answers, null, 2)}
        </pre>
      </div>
    </div>
  )
}
