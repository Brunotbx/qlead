"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  email: string
  name: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está autenticado ao carregar o componente
  useEffect(() => {
    const storedUser = localStorage.getItem("quizleadUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Função de login simples (sem backend real)
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simular uma chamada de API com um pequeno delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Credenciais de teste
    if (email === "admin@example.com" && password === "password123") {
      const userData = { email, name: "Admin User" }
      setUser(userData)
      localStorage.setItem("quizleadUser", JSON.stringify(userData))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("quizleadUser")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
