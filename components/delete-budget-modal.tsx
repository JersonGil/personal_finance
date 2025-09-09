"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId?: string | null;
  onDelete: (id: string) => Promise<{ error: string | null } | void>;
  onAfterChange?: () => Promise<void> | void;
}

export default function DeleteBudgetModal({ isOpen, onClose, budgetId, onDelete, onAfterChange }: Readonly<DeleteBudgetModalProps>) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!budgetId) return;
    setLoading(true);
    try {
      const res = await onDelete(budgetId);
      if (res && 'error' in res && res.error) throw new Error(res.error);
      toast.success("Presupuesto eliminado");
      await onAfterChange?.();
      onClose();
    } catch (e) {
      toast.error("Error eliminando presupuesto");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Eliminar Presupuesto
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer. ¿Seguro que deseas eliminar este presupuesto?
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
