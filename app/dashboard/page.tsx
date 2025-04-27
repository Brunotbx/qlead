import DashboardView from "@/components/dashboard/dashboard-view"
import AuthGuard from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardView />
    </AuthGuard>
  )
}
