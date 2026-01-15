"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./MobileSidebar"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-soft sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
            <span className="sr-only">Ouvrir le menu</span>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-card border-border w-72">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-x-3 lg:gap-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <span className="sr-only">Voir les notifications</span>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-x-3 p-1.5 hover:bg-secondary">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium text-foreground">
                  {user.name || user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-elevated">
              <DropdownMenuLabel className="text-muted-foreground font-normal text-xs uppercase tracking-wide">Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
