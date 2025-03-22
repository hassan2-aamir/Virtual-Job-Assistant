import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/auth-provider"
import { EmployeeSidebar } from "./employee-sidebar"
import { EmployerSidebar } from "./employer-sidebar"
import { UserNav } from "./user-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function AppLayout() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login")
    return null
  }

  // Render appropriate sidebar based on user role
  return (
    <SidebarProvider>
      {user.role === "employee" ? <EmployeeSidebar /> : <EmployerSidebar />}
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

