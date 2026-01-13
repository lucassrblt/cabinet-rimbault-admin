"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/admin/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative shadow-elevated border-border overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
        
        <CardContent className="pt-12 pb-10 text-center">
          {/* 404 Display */}
          <div className="relative mb-8">
            <div className="text-[120px] font-bold leading-none text-primary/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Home className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Page introuvable
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 bg-muted/50 rounded-lg py-3 px-4 mx-auto max-w-fit">
            <Clock className="h-4 w-4 animate-pulse text-primary" />
            <span>Redirection automatique dans</span>
            <span className="font-mono font-semibold text-primary min-w-[2ch] text-center">
              {countdown}
            </span>
            <span>seconde{countdown > 1 ? "s" : ""}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-8">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push("/admin/dashboard")} 
              className="shadow-sm"
            >
              <Home className="mr-2 h-4 w-4" />
              Aller au Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

