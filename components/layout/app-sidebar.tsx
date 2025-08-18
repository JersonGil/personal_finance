"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PiggyBank,
  Wallet,
  Calendar,
  Tags,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Receipt,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useDollarPrice } from '@/providers/dollar-price-provider'

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transacciones",
    href: "/transactions",
    icon: Receipt,
  },
  {
    name: "Balance",
    href: "/balance",
    icon: Wallet,
  },
  {
    name: "Presupuestos",
    href: "/budget",
    icon: PiggyBank,
  },
  {
    name: "Planificación",
    href: "/planning",
    icon: Calendar,
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Tags,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { refresh } = useDollarPrice()

  const displayName = user?.user_metadata?.full_name || user?.email || "Usuario"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
    // Redirigir manualmente tras logout para evitar depender sólo del middleware
    try {
      window.location.replace('/login')
    } catch {
      // fallback
      window.location.href = '/login'
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="lg:hidden fixed inset-0 bg-black/50 z-40 cursor-default"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          // Fixed sidebar always (desktop + mobile) occupying full viewport height
          "fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">Finanzas Personales</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona tu dinero</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-accent">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="/diverse-user-avatars.png" alt="Usuario" />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <p className="text-sm font-medium">Usuario</p>
                    <p className="text-xs text-muted-foreground">{displayName}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="top">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Cuenta</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex justify-between items-center mt-4">
              <ThemeToggle />
              <div className="text-xs text-muted-foreground">v1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
