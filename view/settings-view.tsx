'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import BalanceCategoriesView from './settings/balance-categories-view';
import TransactionCategoriesView from './settings/transaction-categories-view';

export default function SettingsView() {
  return (
    <div className="space-y-8">
      {/* Balance categories */}
      <BalanceCategoriesView />

      {/* Separator */}
      <Separator />

      {/* Transaction categories */}
      <TransactionCategoriesView />
    </div>
  );
}
