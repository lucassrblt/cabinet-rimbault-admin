"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone } from "lucide-react"
import { useState, useEffect } from "react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#acheter", label: "Acheter" },
    { href: "#louer", label: "Louer" },
    { href: "#vendre", label: "Vendre" },
    { href: "#agence", label: "L'Agence" },
  ]

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white shadow-sm" 
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="h-[72px] flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="h-9 w-9 bg-[#780000] rounded-[4px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-lg tracking-tight">R</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-[#222222] leading-tight tracking-tight">
                Cabinet Rimbault
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-[#555555] font-medium">
                Immobilier
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-[#222222] hover:text-[#780000] transition-colors font-medium text-[15px] py-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <a 
              href="tel:+33556000000" 
              className="flex items-center gap-2 text-[#555555] hover:text-[#780000] transition-colors text-sm"
              aria-label="Appelez-nous au 05 56 00 00 00"
            >
              <Phone size={16} strokeWidth={1.5} />
              <span className="font-medium">05 56 00 00 00</span>
            </a>
            <Button 
              className="bg-[#780000] hover:bg-[#5c0000] text-white rounded-[4px] px-5 h-10 font-medium text-sm shadow-none transition-all duration-200 hover:shadow-md"
              aria-label="Demander une estimation gratuite"
            >
              Estimation offerte
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#222222] hover:bg-gray-50"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white border-l border-gray-100 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center gap-2.5 p-6 border-b border-gray-100">
                  <div className="h-9 w-9 bg-[#780000] rounded-[4px] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="text-base font-semibold text-[#222222]">
                    Cabinet Rimbault
                  </span>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-base font-medium text-[#222222] hover:text-[#780000] hover:bg-gray-50 px-6 py-3.5 transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <div className="mt-auto p-6 space-y-4 border-t border-gray-100">
                  <a 
                    href="tel:+33556000000" 
                    className="flex items-center justify-center gap-2 text-[#555555] py-2"
                    aria-label="Appelez-nous"
                  >
                    <Phone size={16} strokeWidth={1.5} />
                    <span className="font-medium text-sm">05 56 00 00 00</span>
                  </a>
                  <Button 
                    className="bg-[#780000] hover:bg-[#5c0000] text-white w-full h-11 font-medium rounded-[4px] shadow-none"
                    aria-label="Demander une estimation gratuite"
                  >
                    Estimation offerte
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
