import React from "react"
import type { ReactNode } from "react"
import "./styles.css"

export default function QuizPublicLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Pesquisa</title>
      </head>
      <body>
        <ErrorBoundary
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7]">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-md">
                <h2 className="text-xl font-bold mb-4">Erro na Pesquisa</h2>
                <p className="text-center py-4 text-[#667085]">
                  Ocorreu um erro ao carregar a pesquisa. Por favor, tente novamente.
                </p>
              </div>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}

// Componente ErrorBoundary para capturar erros de renderização
class ErrorBoundary extends React.Component<{
  children: ReactNode
  fallback: ReactNode
}> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Erro na renderização:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
