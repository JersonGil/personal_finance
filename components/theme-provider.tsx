"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const isBrowser = typeof window !== 'undefined'

  // Cargar tema guardado sólo en cliente
  React.useEffect(() => {
    if (!isBrowser) return
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored) setTheme(stored)
    } catch {/* ignore */}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Aplicar clase al <html>
  React.useEffect(() => {
    if (!isBrowser) return
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    let effective: Theme
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effective = isDark ? 'dark' : 'light'
    } else {
      effective = theme
    }
    root.classList.add(effective)
  }, [theme, isBrowser])

  // Escuchar cambios del sistema si theme === system
  React.useEffect(() => {
    if (!isBrowser || theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, isBrowser])

  const value = React.useMemo<ThemeProviderState>(() => ({
    theme,
    setTheme: (t: Theme) => {
      try { if (isBrowser) localStorage.setItem(storageKey, t) } catch {/* ignore */}
      setTheme(t)
    }
  }), [theme, storageKey, isBrowser])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
