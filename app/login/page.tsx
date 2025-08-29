'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithMagicLink, type PrevState } from './actions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState: PrevState = {
  errors: undefined,
  messages: '',
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, initialState);

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
          {state.messages && (
            <Alert variant="default">
              <AlertDescription>{state.messages}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="tu@email.com"
              required
              className={state?.errors ? 'border-red-500' : ''}
            />
            <p aria-live="polite" className="text-red-500 text-xs ml-1">
              {state?.errors}
            </p>
          </div>

          <Button className="w-full" variant="outline" type="submit">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar con enlace mágico
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
