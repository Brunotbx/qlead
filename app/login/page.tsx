"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Credenciais inválidas. Use admin@example.com / password123")
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-black">quiz</span>
            <span className="text-[#ff9811]">lead</span>
          </h1>
          <p className="mt-2 text-[#667085]">Entre para acessar sua conta</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e6e6e6]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-[#344054]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-[#344054]">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-white"
              style={{ backgroundColor: "#ff9811" }}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-sm text-center text-[#667085] mt-4">
              Não possui uma conta?{" "}
              <Link href="/register" className="text-[#ff9811] font-medium hover:underline">
                Registre-se
              </Link>
            </div>

            <div className="text-sm text-center text-[#667085] mt-4">
              Use as credenciais de teste:
              <div className="mt-1 font-medium">
                Email: admin@example.com
                <br />
                Senha: password123
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
