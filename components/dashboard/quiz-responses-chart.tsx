"use client"

import { useEffect, useRef } from "react"

interface ResponsesByQuestion {
  questionId: string
  questionTitle: string
  responseCount: number
  completionPercentage: number
}

interface QuizResponsesChartProps {
  responsesByQuestion: ResponsesByQuestion[]
  themeColor: string
}

export default function QuizResponsesChart({ responsesByQuestion, themeColor }: QuizResponsesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || responsesByQuestion.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações do gráfico
    const padding = 40
    const barHeight = 30
    const barGap = 15
    const maxBarWidth = canvas.width - padding * 2

    // Encontrar o valor máximo para escala
    const maxValue = Math.max(...responsesByQuestion.map((q) => q.responseCount))

    // Ajustar a altura do canvas com base no número de questões
    canvas.height = (barHeight + barGap) * responsesByQuestion.length + padding * 2

    // Desenhar eixo Y (linhas de referência)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Desenhar barras para cada questão
    responsesByQuestion.forEach((question, index) => {
      const y = padding + index * (barHeight + barGap)
      const barWidth = maxValue > 0 ? (question.responseCount / maxValue) * maxBarWidth : 0

      // Desenhar barra
      ctx.fillStyle = themeColor
      ctx.fillRect(padding, y, barWidth, barHeight)

      // Desenhar rótulo da questão (truncado se necessário)
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      let title = question.questionTitle
      if (title.length > 30) {
        title = title.substring(0, 27) + "..."
      }
      ctx.fillText(title, padding, y - 5)

      // Desenhar valor
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.fillText(`${question.responseCount}`, padding + barWidth + 5, y + barHeight / 2 + 4)
    })
  }, [responsesByQuestion, themeColor])

  if (responsesByQuestion.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#667085]">Sem dados disponíveis</p>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center overflow-auto">
      <canvas ref={canvasRef} width={600} height={400} className="max-w-full" />
    </div>
  )
}
