"use client"

import { createContext, useContext, useRef, useMemo } from "react"
import type { User, Session } from "@supabase/supabase-js"

interface AuthBootstrapContextValue {
  initialUser: User | null
  initialSession: Session | null
}

const AuthBootstrapContext = createContext<AuthBootstrapContextValue | null>(null)

export function AuthProvider({
  children,
  initialUser,
  initialSession,
}: Readonly<{
  children: React.ReactNode
  initialUser: User | null
  initialSession: Session | null
}>) {
  // Keep them stable via refs so consumer effects don't re-run
  const userRef = useRef(initialUser)
  const sessionRef = useRef(initialSession)
  const value = useMemo(() => ({ initialUser: userRef.current, initialSession: sessionRef.current }), [])
  return <AuthBootstrapContext.Provider value={value}>{children}</AuthBootstrapContext.Provider>
}

export function useAuthBootstrap() {
  return useContext(AuthBootstrapContext)
}
