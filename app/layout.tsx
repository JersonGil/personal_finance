import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { DollarPriceProvider } from "@/providers/dollar-price-provider"
import { createClient } from "@/lib/server"
import { AuthProvider } from "@/components/auth/auth-provider"
import Header from "@/components/layout/header"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import AppSidebar from "@/components/layout/app-sidebar"

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
    const { data } = await sb.auth.getSession()
    initialSession = data.session
    initialUser = data.session?.user ?? null
  } catch {
    // ignore
  }

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>        
        <DollarPriceProvider>
          <AuthProvider initialUser={initialUser} initialSession={initialSession}>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <Header />
                <main className="p-4 max-w-7xl mx-auto w-full space-y-6">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </AuthProvider>
        </DollarPriceProvider>
        <Toaster />
      </body>
    </html>
  )
}
