"use client"

import Link, { useLinkStatus } from "next/link"
import { forwardRef, type ComponentProps, type MouseEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = ComponentProps<typeof Link> & {
  children: ReactNode
  pendingDotClassName?: string
}

function LinkPendingDot({ className }: { className?: string }) {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span
      aria-hidden
      className={cn(
        "ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70 animate-pulse",
        className
      )}
    />
  )
}

export const SidebarNavLink = forwardRef<HTMLAnchorElement, Props>(function SidebarNavLink(
  { children, onClick, pendingDotClassName, ...props },
  ref
) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("nav:start"))
    }
    onClick?.(e)
  }

  return (
    <Link ref={ref} {...props} onClick={handleClick}>
      {children}
      <LinkPendingDot className={pendingDotClassName} />
    </Link>
  )
})
