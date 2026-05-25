"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Phase = "idle" | "starting" | "loading" | "done"

export function NavigationProgress() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>("idle")

  useEffect(() => {
    const handler = () => {
      setPhase("starting")
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase((p) => (p === "starting" ? "loading" : p))
        })
      })
    }
    window.addEventListener("nav:start", handler)
    return () => window.removeEventListener("nav:start", handler)
  }, [])

  useEffect(() => {
    setPhase((p) => (p === "loading" || p === "starting" ? "done" : p))
  }, [pathname])

  useEffect(() => {
    if (phase !== "done") return
    const t = setTimeout(() => setPhase("idle"), 300)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === "idle") return null

  const widthClass = {
    starting: "w-0 opacity-100",
    loading: "w-[80%] opacity-100",
    done: "w-full opacity-0",
  }[phase]

  const transitionClass = {
    starting: "transition-none",
    loading: "transition-[width] duration-[600ms] ease-out",
    done: "transition-[width,opacity] duration-300 ease-out",
  }[phase]

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
      aria-hidden
    >
      <div className={cn("h-full bg-primary shadow-[0_0_6px_rgba(120,0,0,0.5)]", widthClass, transitionClass)} />
    </div>
  )
}
