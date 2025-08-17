'use client'

import React, { useState } from 'react';

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

const getLocaleByCurrency = (code: string) => (code === "USD" ? "en-US" : "es-VE")

const formatByCurrency = (value: number, code: string): string => {
  if (Number.isNaN(value)) return ""
  return new Intl.NumberFormat(getLocaleByCurrency(code), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Convierte texto formateado a número (con punto decimal).
const parseByCurrency = (input: string, code: string): number => {
  const locale = getLocaleByCurrency(code)
  if (locale === "en-US") {
    // miles: ',', decimal: '.'
    const cleaned = input.replace(/,/g, "")
    const num = Number.parseFloat(cleaned)
    return Number.isNaN(num) ? NaN : num
  } else {
    // es-VE => miles: '.', decimal: ','
    const cleaned = input.replace(/\./g, "").replace(/,/g, ".")
    const num = Number.parseFloat(cleaned)
    return Number.isNaN(num) ? NaN : num
  }
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  primaryCurrency,
  secondaryCurrency,
  className = "",
  title,
  price,
  onChangeAmount
}) => {
  const [primaryDisplay, setPrimaryDisplay] = useState<string>('');
  const [secondaryDisplay, setSecondaryDisplay] = useState<string>('');

  const handlePrimaryChange = (value: string) => {
    setPrimaryDisplay(value)

    const primaryNum = parseByCurrency(value, primaryCurrency.code)
    if (!value || Number.isNaN(primaryNum)) {
      setSecondaryDisplay('')
      onChangeAmount('', '')
      return
    }

    // Bs -> USD: USD = Bs / price
    // USD -> Bs: Bs = USD * price
    const converted =
      primaryCurrency.code === "USD"
        ? primaryNum * Number(price)
        : primaryNum / Number(price)

    // Actualiza display formateado para la secundaria
    setSecondaryDisplay(formatByCurrency(converted, secondaryCurrency.code))

    // Notificar con valores normalizados (punto decimal, sin separadores)
    onChangeAmount(primaryNum.toFixed(2), converted.toFixed(2))
  }

  const handleSecondaryChange = (value: string) => {
    setSecondaryDisplay(value)

    const secondaryNum = parseByCurrency(value, secondaryCurrency.code)
    if (!value || Number.isNaN(secondaryNum)) {
      setPrimaryDisplay('')
      onChangeAmount('', '')
      return
    }

    const converted =
      secondaryCurrency.code === "USD"
        ? secondaryNum * Number(price)
        : secondaryNum / Number(price)

    setPrimaryDisplay(formatByCurrency(converted, primaryCurrency.code))
    onChangeAmount(converted.toFixed(2), secondaryNum.toFixed(2))
  }

  return (
    <div className={`px-2 max-w-md mx-auto ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        </div>

        {/* Primary Currency Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            De ({primaryCurrency.name})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-lg font-semibold">
                {primaryCurrency.symbol}
              </span>
            </div>
            <input
              type="text"
              value={primaryDisplay}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              placeholder={formatByCurrency(0, primaryCurrency.code)}
              className="block w-full pl-12 pr-4 py-2 text-lg font-semibold rounded-xl border border-border bg-muted/60 dark:bg-muted/30 text-foreground dark:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              inputMode="decimal"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-sm font-medium">
                {primaryCurrency.code}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Currency Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            A ({secondaryCurrency.name})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-muted-foreground text-lg font-semibold">
                {secondaryCurrency.symbol}
              </span>
            </div>
            <input
              type="text"
              value={secondaryDisplay}
              onChange={(e) => handleSecondaryChange(e.target.value)}
              placeholder={formatByCurrency(0, secondaryCurrency.code)}
        className="block w-full pl-12 pr-4 py-2 text-lg font-semibold rounded-xl border border-border bg-muted/60 dark:bg-muted/30 text-foreground dark:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              inputMode="decimal"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <span className="text-muted-foreground text-sm font-medium">
                {secondaryCurrency.code}
              </span>
            </div>
          </div>
      <p className="text-sm mt-2 ml-2 text-muted-foreground">
            1 {primaryCurrency.code} = {formatByCurrency(Number(price) || 0, secondaryCurrency.code)} {secondaryCurrency.code}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;