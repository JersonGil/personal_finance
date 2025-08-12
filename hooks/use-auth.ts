"use client"

import { useState, useEffect } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useAuthBootstrap } from "@/components/auth/auth-provider"

export function useAuth() {
  const bootstrap = useAuthBootstrap()
  const [user, setUser] = useState<User | null>(bootstrap?.initialUser ?? null)
  const [session, setSession] = useState<Session | null>(bootstrap?.initialSession ?? null)
  const [loading, setLoading] = useState(!bootstrap?.initialUser)

  useEffect(() => {
    // Get initial session
    if (!bootstrap?.initialUser) {
      // Secure fetch of authenticated user (server round-trip)
      supabase.auth.getUser().then(async ({ data }) => {
        setUser(data.user ?? null)
        const { data: sess } = await supabase.auth.getSession()
        setSession(sess.session)
        setLoading(false)
      })
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // After sign-in or token refresh, re-validate user from server for authenticity
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        supabase.auth.getUser().then(async ({ data }) => {
          setUser(data.user ?? null)
          const { data: sess } = await supabase.auth.getSession()
          setSession(sess.session)
          setLoading(false)
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [bootstrap])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Login solo con correo usando magic link
  const signInWithMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.NODE_ENV === 'production' ? `https://personal-finance-sage-gamma.vercel.app` : `${window.location.origin}`,
      },
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signInWithMagicLink, // <-- exporta la nueva función
    signUp,
    signOut,
    resetPassword,
  }
}
