import QuizDetailsView from "@/components/dashboard/quiz-details-view"
import AuthGuard from "@/components/auth-guard"

export default function QuizDetailsPage({ params }: { params: { quizId: string } }) {
  return (
    <AuthGuard>
      <QuizDetailsView quizId={params.quizId} />
    </AuthGuard>
  )
}
