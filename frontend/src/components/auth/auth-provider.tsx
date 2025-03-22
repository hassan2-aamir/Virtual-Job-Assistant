import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type UserRole = "employee" | "employer"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  switchRole: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists (in a real app, this would be done by the backend)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const existingUser = users.find((u: any) => u.email === email)

      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        password, // In a real app, this would be hashed on the server
      }

      // Save to "database"
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Note: We don't log the user in automatically after registration
      return
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, authentication would be handled by the backend
      // Here we're simulating it with localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find((u: any) => u.email === email && u.password === password && u.role === role)

      if (!foundUser) {
        throw new Error("Invalid credentials or user not found")
      }

      // Create user session without the password
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const switchRole = () => {
    if (!user) return

    const newRole = user.role === "employee" ? "employer" : "employee"
    const updatedUser = { ...user, role: newRole }

    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

