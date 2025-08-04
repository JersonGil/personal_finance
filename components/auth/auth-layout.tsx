"use client"

import { useState } from "react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import ForgotPasswordForm from "./forgot-password-form"

type AuthMode = "login" | "register" | "forgot-password"

export default function AuthLayout() {
  const [mode, setMode] = useState<AuthMode>("login")

  const handleToggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
  }

  const handleForgotPassword = () => {
    setMode("forgot-password")
  }

  const handleBackToLogin = () => {
    setMode("login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === "login" && <LoginForm onToggleMode={handleToggleMode} onForgotPassword={handleForgotPassword} />}
        {mode === "register" && <RegisterForm onToggleMode={handleToggleMode} />}
        {mode === "forgot-password" && <ForgotPasswordForm onBack={handleBackToLogin} />}
      </div>
    </div>
  )
}
