import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { DollarPriceProvider } from "@/providers/dollar-price-provider"
import { createClient } from "@/lib/server"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from '@/components/theme-provider'
import { GlobalLoader } from '@/components/global-loader'
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Sidebar } from "@/components/layout/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finanzas Personales",
  description: "Gestiona tus finanzas personales",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let initialUser = null
  let initialSession = null

  try {
    const sb = await createClient()
    // Fetch authenticated user with a round-trip (more secure than relying solely on cached session)
    const { data: { user } } = await sb.auth.getUser()
    initialUser = user ?? null
    // Optionally still obtain session (tokens, expiry) after establishing authentic user
    if (user) {
      const { data: sessionData } = await sb.auth.getSession()
      initialSession = sessionData.session
    }
  } catch {
    // ignore
  }

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <GlobalLoader />
          <DollarPriceProvider>
            <AuthProvider initialUser={initialUser} initialSession={initialSession}>
              <div className="flex h-screen bg-background">
                <SidebarProvider>
                  <Sidebar />
                  <main className="p-4 max-w-7xl mx-auto w-full space-y-6">
                    {children}
                  </main>
                </SidebarProvider>
              </div>
            </AuthProvider>
          </DollarPriceProvider>
          <Toaster />
        </ThemeProvider> 
      </body>
    </html>
  )
}
