"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart3, Wallet2, Settings, LayoutDashboard } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Presupuestos", icon: BarChart3 },
  { href: "/balance", label: "Balance", icon: Wallet2 },
  { href: "/settings", label: "Configuración", icon: Settings },
]

export default function AppSidebar() {
  const pathname = usePathname() || ""

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="flex flex-row items-center justify-between">
        <span className="font-bold text-lg px-2">Finanzas</span>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(item => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-gray-500 px-2">&copy; {new Date().getFullYear()} Finanzas</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
