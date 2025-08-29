import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Calculator, TrendingUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-2">Página no encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir al Dashboard
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/transactions">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Transacciones
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/categories">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Categorías
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              ¿Necesitas ayuda? Revisa tu{' '}
              <Link href="/budget" className="text-primary hover:underline">
                presupuesto
              </Link>{' '}
              o{' '}
              <Link href="/planning" className="text-primary hover:underline">
                planificación
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
