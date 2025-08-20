'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PlannedRow } from '@/hooks/use-planned-transactions';

interface CategoryRow {
  id: string;
  name: string;
  type: string;
}

interface PlanningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlanned: PlannedRow | null;
  formData: {
    description: string;
    amount: string;
    category: string;
    type: 'income' | 'expense';
  };
  setFormData: (data: {
    description: string;
    amount: string;
    category: string;
    type: 'income' | 'expense';
  }) => void;
  onSave: () => void;
  categories: CategoryRow[];
}

export function PlanningModal({
  open,
  onOpenChange,
  editingPlanned,
  formData,
  setFormData,
  onSave,
  categories,
}: Readonly<PlanningModalProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingPlanned ? 'Editar' : 'Agregar'} Transacción Planificada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la transacción"
            />
          </div>
          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  ?.filter((c) => c.type === formData.type)
                  ?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onSave} className="w-full">
            {editingPlanned ? 'Actualizar' : 'Agregar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
