"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Tags,
  Settings,
  LogOut,
  Home,
  Plus,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Annonces",
    href: "/admin/properties",
    icon: Building2,
  },
  {
    name: "Nouvelle annonce",
    href: "/admin/properties/new",
    icon: Plus,
  },
  {
    name: "Étiquettes vitrine",
    href: "/admin/labels",
    icon: Tags,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4 shadow-soft">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">Cabinet Rimbault</span>
            <span className="text-xs text-muted-foreground">Administration</span>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* Bottom actions */}
            <li className="mt-auto">
              <Separator className="mb-4" />
              <Link
                href="/admin/settings"
                className="group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                <Settings className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                Paramètres
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-x-3 p-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Déconnexion
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
