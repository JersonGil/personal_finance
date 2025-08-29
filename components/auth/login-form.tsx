import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithMagicLink } from '@/app/login/actions';
import { useFormState } from 'react-dom';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: Readonly<LoginFormProps>) {
  const initialState = { errors: undefined as string[] | undefined, messages: '' };
  const [state, formAction] = useFormState(signInWithMagicLink, initialState);
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="tu@email.com" required />
          </div>

          <Button type="submit" className="w-full" variant="outline">
            Iniciar con enlace mágico
          </Button>

          {state.errors && state.errors.length > 0 && (
            <ul className="text-sm text-red-500 list-disc list-inside">
              {state.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
          {state.messages && !state.errors && (
            <p className="text-sm text-green-600">{state.messages}</p>
          )}

          <div className="text-center space-y-2">
            <Button type="button" variant="link" className="text-sm" onClick={onForgotPassword}>
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
