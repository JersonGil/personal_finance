import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const NoTransactions: React.FC<{ messages: string }> = ({ messages }) => (
  <Card className="flex items-center justify-center border-dashed border-2 border-gray-300 bg-gray-50 py-8">
    <CardContent className="flex flex-col items-center justify-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground text-center">{messages}</p>
    </CardContent>
  </Card>
);

export default NoTransactions;
