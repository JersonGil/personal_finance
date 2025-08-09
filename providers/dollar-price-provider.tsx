"use client"

import { createContext, useContext, useMemo, useRef, useState, ReactNode } from "react"

interface DollarPriceContextValue {
  price: number | null
  loading: boolean
  refresh: () => Promise<void>
}

const DollarPriceContext = createContext<DollarPriceContextValue | undefined>(undefined)

const getDollarPrice = async () => {
  const res = await fetch('/api/get-dollar-price');
  if (!res.ok) throw new Error('Error al obtener el precio del dólar');
  const data = await res.json();
  return data.price;
}

export function DollarPriceProvider({ children }: { readonly children: ReactNode }) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshingRef = useRef(false)

  const fetchPrice = async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    setLoading((prev) => prev && price === null)
    try {
      const p = await getDollarPrice()
      if (p !== null) setPrice(Number(p))
    } finally {
      refreshingRef.current = false
      setLoading(false)
    }
  }

  const contextValue = useMemo(() => ({
    price,
    loading,
    refresh: fetchPrice,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [price, loading]);

  return (
    <DollarPriceContext.Provider
      value={contextValue}
    >
      {children}
    </DollarPriceContext.Provider>
  )
}

export function useDollarPrice() {
  const ctx = useContext(DollarPriceContext)
  if (!ctx) {
    throw new Error("useDollarPrice debe usarse dentro de DollarPriceProvider")
  }
  return ctx
}
