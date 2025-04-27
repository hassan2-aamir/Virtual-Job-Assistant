"use client"

import type React from "react"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./components/auth/auth-provider"
import { AppLayout } from "./components/layout/app-layout"
import LoginPage from "./pages/login"
import SignupPage from "./pages/signup"
import ChangePasswordPage from "./pages/changepassword"
import { ThemeProvider } from "./components/theme/theme-provider"


// Employee pages
import SearchJobsPage from "./pages/employee/search-jobs"
import MyApplicationsPage from "./pages/employee/my-applications"
import MyResumePage from "./pages/employee/my-resume"
import ResumePolisherPage from "./pages/employee/resume-polisher"
import CoverLetterGeneratorPage from "./pages/employee/cover-letter-generator"

// Employer pages
import AddJobsPage from "./pages/employer/add-jobs"
import MyJobsPage from "./pages/employer/my-jobs"


// Protected route component
function ProtectedRoute({
  children,
  requiredRole,
}: { children: React.ReactNode; requiredRole?: "employee" | "employer" }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "employee" ? "/employee/search-jobs" : "/employer/my-jobs"} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider  defaultTheme="system">

    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRole="employee">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="search-jobs" element={<SearchJobsPage />} />
        <Route path="my-applications" element={<MyApplicationsPage />} />
        <Route path="my-resume" element={<MyResumePage />} />
        <Route path="resume-polisher" element={<ResumePolisherPage />} />
        <Route path="cover-letter-generator" element={<CoverLetterGeneratorPage />} />
      </Route>

      {/* Employer Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute requiredRole="employer">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="add-jobs" element={<AddJobsPage />} />
        <Route path="my-jobs" element={<MyJobsPage />} />
      </Route>

      <Route
        path="/changepassword"
        element={
            <ChangePasswordPage />
        }
      />
      {/* Catch all */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </ThemeProvider>
  )
}

export default App
