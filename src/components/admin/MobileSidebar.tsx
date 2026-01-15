"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Tags,
  FileText,
  Settings,
  LogOut,
  Home,
  Plus,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SheetClose } from "@/components/ui/sheet"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Annonces",
    href: "/properties",
    icon: Building2,
  },
  {
    name: "Étiquettes vitrine",
    href: "/labels",
    icon: Tags,
  },
  {
    name: "Fiches descriptives",
    href: "/descriptive-sheets",
    icon: FileText,
  },
]

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 pt-4">
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
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                
                return (
                  <li key={item.name}>
                    <SheetClose asChild>
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
                    </SheetClose>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Bottom actions */}
          <li className="mt-auto">
            {/* Nouvelle annonce - CTA Button */}
            <SheetClose asChild>
              <Link href="/properties/new">
                <Button className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle annonce
                </Button>
              </Link>
            </SheetClose>
            
            <Separator className="mb-4" />
            <SheetClose asChild>
              <Link
                href="/settings"
                className="group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                <Settings className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                Paramètres
              </Link>
            </SheetClose>
            <Button
              variant="ghost"
              className="w-full justify-start gap-x-3 p-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Déconnexion
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
