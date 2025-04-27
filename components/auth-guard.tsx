"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Mostrar nada enquanto verifica a autenticação
  if (loading) {
    return null
  }

  // Se não estiver autenticado, não renderiza nada (será redirecionado)
  if (!user) {
    return null
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>
}
