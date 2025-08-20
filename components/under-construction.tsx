import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export function UnderConstruction({
  title = 'Vista en construcción',
  description = 'Estamos trabajando para traerte esta funcionalidad pronto.',
}: Readonly<UnderConstructionProps>) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground">
        Versión preliminar • Habrá más actualizaciones
      </p>
    </div>
  );
}
