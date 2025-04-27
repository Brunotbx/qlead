import QuizEditor from "@/components/quiz-editor"
import AuthGuard from "@/components/auth-guard"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <AuthGuard>
        <QuizEditor />
      </AuthGuard>
    </main>
  )
}
