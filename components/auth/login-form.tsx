import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithMagicLink } from "@/app/login/actions"

interface LoginFormProps {
  onForgotPassword: () => void
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <Button
            type="button"
            className="w-full"
            variant="outline"
            formAction={signInWithMagicLink}
          >
            Iniciar con enlace mágico
          </Button>

          <div className="text-center space-y-2">
            <Button type="button" variant="link" className="text-sm" onClick={onForgotPassword}>
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
