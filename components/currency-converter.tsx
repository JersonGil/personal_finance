'use client'

import React, { useState, useEffect } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyConverterProps {
  primaryCurrency: Currency
  secondaryCurrency: Currency
  className?: string
  title?: string
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

  useEffect(() => {
    onChangeAmount(primaryAmount, secondaryAmount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryAmount, secondaryAmount])

  const parseAmount = (value: string): number => {
    const cleanValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  const handlePrimaryChange = (value: string) => {
    setPrimaryAmount(value);
    
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
    
    const numericValue = parseAmount(value);
    if (numericValue === 0 && value === '') {
      setPrimaryAmount('');
    } else {
      const converted = numericValue * Number(price);
      setPrimaryAmount(converted.toFixed(2));
    }
  };

  return (
    <div className={`p-2 max-w-md mx-auto ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
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
          <p className="text-sm mt-2 ml-2 text-gray-500">
            1 {primaryCurrency.code} = {Number(price).toFixed(2)} {secondaryCurrency.code}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;