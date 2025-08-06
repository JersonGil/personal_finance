'use client'

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyConverterProps {
  primaryCurrency: Currency
  secondaryCurrency: Currency
  className?: string
  title: string
  price: number
  onChangeAmount: (primary: string, secondary: string) => void
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  primaryCurrency,
  secondaryCurrency,
  className = "",
  title,
  price,
  onChangeAmount
}) => {
  const [primaryAmount, setPrimaryAmount] = useState<string>('');
  const [secondaryAmount, setSecondaryAmount] = useState<string>('');
  const [lastChanged, setLastChanged] = useState<'primary' | 'secondary' | null>(null);

  useEffect(() => {
    onChangeAmount(primaryAmount, secondaryAmount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryAmount, secondaryAmount])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseAmount = (value: string): number => {
    const cleanValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  const handlePrimaryChange = (value: string) => {
    setPrimaryAmount(value);
    setLastChanged('primary');
    
    const numericValue = parseAmount(value);
    if (numericValue === 0 && value === '') {
      setSecondaryAmount('');
    } else {
      const converted = numericValue / Number(price);
      setSecondaryAmount(converted.toFixed(2));
    }
  };

  const handleSecondaryChange = (value: string) => {
    setSecondaryAmount(value);
    setLastChanged('secondary');
    
    const numericValue = parseAmount(value);
    if (numericValue === 0 && value === '') {
      setPrimaryAmount('');
    } else {
      const converted = numericValue * Number(price);
      setPrimaryAmount(converted.toFixed(2));
    }
  };

  const calculateDifference = (): string => {
    const primaryValue = parseAmount(primaryAmount);
    const secondaryValue = parseAmount(secondaryAmount);
    
    if (primaryValue === 0 || secondaryValue === 0) return '0.00';

    const expectedSecondary = primaryValue / Number(price);
    const difference = Math.abs(expectedSecondary - secondaryValue);
    
    return difference.toFixed(2);
  };

  const swapCurrencies = () => {
    setPrimaryAmount(secondaryAmount);
    setSecondaryAmount(primaryAmount);
    onChangeAmount(secondaryAmount, primaryAmount);
    setLastChanged(lastChanged === 'primary' ? 'secondary' : 'primary');
  };

  return (
    <div className={`p-8 max-w-md mx-auto ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-sm text-gray-500">
            1 {primaryCurrency.code} = {Number(price).toFixed(2)} {secondaryCurrency.code}
          </p>
        </div>

        {/* Primary Currency Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            De ({primaryCurrency.name})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg font-semibold">
                {primaryCurrency.symbol}
              </span>
            </div>
            <input
              type="number"
              value={primaryAmount}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-12 pr-4 py-4 text-lg font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm font-medium">
                {primaryCurrency.code}
              </span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200 group"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Secondary Currency Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            A ({secondaryCurrency.name})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg font-semibold">
                {secondaryCurrency.symbol}
              </span>
            </div>
            <input
              type="number"
              value={secondaryAmount}
              onChange={(e) => handleSecondaryChange(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-12 pr-4 py-4 text-lg font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm font-medium">
                {secondaryCurrency.code}
              </span>
            </div>
          </div>
        </div>

        {/* Difference Amount */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Monto diferido</p>
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(parseFloat(calculateDifference()))}
            </p>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="text-center text-xs text-gray-400 border-t pt-4">
          <p>Exchange rates are updated in real-time</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;