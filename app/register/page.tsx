"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [company, setCompany] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validação básica
    if (!name || !email || !phone || !birthDate || !company) {
      setError("Todos os campos são obrigatórios")
      return
    }

    // Validação de aceite dos termos
    if (!acceptTerms) {
      setError("Você precisa aceitar os termos de uso para continuar")
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Email inválido")
      return
    }

    // Validação de telefone (formato básico)
    const phoneRegex = /^\d{10,11}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      setError("Telefone inválido. Use apenas números (10 ou 11 dígitos)")
      return
    }

    try {
      // Simular uma chamada de API com um pequeno delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulação de registro bem-sucedido
      setSuccess(true)

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError("Ocorreu um erro ao registrar")
    }
  }

  // Formatação de telefone enquanto digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 11) {
      setPhone(value)
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
          <p className="mt-2 text-[#667085]">Crie sua conta para começar</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e6e6e6]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              Registro realizado com sucesso! Redirecionando para o login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-[#344054]">
                Nome completo
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

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
              <label htmlFor="phone" className="block mb-1 text-sm font-medium text-[#344054]">
                Telefone
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block mb-1 text-sm font-medium text-[#344054]">
                Data de nascimento
              </label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

            <div>
              <label htmlFor="company" className="block mb-1 text-sm font-medium text-[#344054]">
                Nome da empresa
              </label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nome da sua empresa"
                required
                className="w-full border-[#d0d5dd]"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 border border-[#d0d5dd] rounded focus:ring-2 focus:ring-[#ff9811]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-[#344054]">
                  Eu aceito os{" "}
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-[#ff9811] font-medium hover:underline"
                  >
                    termos de uso
                  </button>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-white"
              style={{ backgroundColor: "#ff9811" }}
              disabled={loading || success}
            >
              {loading ? "Processando..." : "Registrar"}
            </Button>

            <div className="text-sm text-center text-[#667085] mt-4">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-[#ff9811] font-medium hover:underline">
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos de Uso</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-[#344054] space-y-4">
            <h2 className="text-lg font-semibold">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o QuizLead, você concorda em cumprir e estar vinculado aos seguintes termos e
              condições de uso. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar
              nossos serviços.
            </p>

            <h2 className="text-lg font-semibold">2. Descrição do Serviço</h2>
            <p>
              O QuizLead é uma plataforma que permite aos usuários criar, gerenciar e distribuir pesquisas e
              questionários interativos. Nosso serviço inclui ferramentas para personalização, coleta de respostas e
              análise de dados.
            </p>

            <h2 className="text-lg font-semibold">3. Conta de Usuário</h2>
            <p>
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas. Você
              é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua
              conta.
            </p>

            <h2 className="text-lg font-semibold">4. Privacidade e Proteção de Dados</h2>
            <p>
              Respeitamos sua privacidade e estamos comprometidos com a proteção de seus dados pessoais. Nossa Política
              de Privacidade descreve como coletamos, usamos e compartilhamos suas informações.
            </p>

            <h2 className="text-lg font-semibold">5. Conteúdo do Usuário</h2>
            <p>
              Você mantém todos os direitos sobre o conteúdo que cria e compartilha através do QuizLead. Ao publicar
              conteúdo, você nos concede uma licença mundial, não exclusiva e isenta de royalties para usar, modificar,
              executar publicamente, exibir publicamente e distribuir seu conteúdo em conexão com nossos serviços.
            </p>

            <h2 className="text-lg font-semibold">6. Conduta do Usuário</h2>
            <p>
              Você concorda em não usar o QuizLead para qualquer finalidade ilegal ou proibida por estes termos. Você
              não pode usar o serviço de maneira que possa danificar, desativar, sobrecarregar ou prejudicar o QuizLead
              ou interferir no uso e aproveitamento do serviço por qualquer outra parte.
            </p>

            <h2 className="text-lg font-semibold">7. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância o QuizLead, seus diretores, funcionários ou agentes serão responsáveis por
              quaisquer danos diretos, indiretos, incidentais, especiais, punitivos ou consequentes decorrentes do uso
              ou incapacidade de usar nossos serviços.
            </p>

            <h2 className="text-lg font-semibold">8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Continuando a acessar ou usar nossos
              serviços após tais modificações, você concorda em estar vinculado aos termos revisados.
            </p>

            <h2 className="text-lg font-semibold">9. Rescisão</h2>
            <p>
              Podemos encerrar ou suspender sua conta e acesso ao QuizLead imediatamente, sem aviso prévio ou
              responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos de Uso.
            </p>

            <h2 className="text-lg font-semibold">10. Lei Aplicável</h2>
            <p>
              Estes termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos
              de princípios legais.
            </p>

            <p className="mt-6 font-medium">
              Ao clicar em "Eu aceito os termos de uso", você reconhece que leu, entendeu e concorda em estar vinculado
              a estes termos.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setTermsModalOpen(false)
                setAcceptTerms(true)
              }}
              style={{ backgroundColor: "#ff9811" }}
              className="text-white"
            >
              Aceitar e Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
