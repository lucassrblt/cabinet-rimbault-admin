"use client"

import * as React from "react"
import { MapPin, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyEstimationBannerProps {
  onEstimate?: (address: string) => void
  className?: string
  backgroundImage?: string
}

export function PropertyEstimationBanner({
  onEstimate,
  className,
  backgroundImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
}: PropertyEstimationBannerProps) {
  const [address, setAddress] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim() && onEstimate) {
      onEstimate(address.trim())
    }
  }

  const features = [
    { label: "Fiable", id: "reliable" },
    { label: "Rapide", id: "fast" },
    { label: "Efficace", id: "efficient" }
  ]

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        "min-h-[280px] md:min-h-[320px]",
        className
      )}
    >
      {/* Background container with diagonal split */}
      <div className="absolute inset-0 flex">
        {/* Blue background section */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#7CB9E8] via-[#89CFF0] to-[#6CB4EE]"
          style={{
            clipPath: "polygon(0 0, 65% 0, 50% 100%, 0 100%)"
          }}
        />
        
        {/* Image section with diagonal cut */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: "polygon(50% 0, 100% 0, 100% 100%, 35% 100%)"
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* White diagonal line accent */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom right, transparent 49.5%, white 49.5%, white 50.5%, transparent 50.5%)",
            clipPath: "polygon(45% 0, 55% 0, 40% 100%, 30% 100%)"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full min-h-[280px] md:min-h-[320px] px-6 md:px-12 py-8 md:py-12">
        {/* Left side - Text */}
        <div className="flex-1 max-w-md lg:max-w-lg">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light italic text-white leading-tight mb-3">
            Découvrez le prix de votre
            <br />
            bien par rapport au marché
          </h2>
          <p className="text-white/90 text-base md:text-lg">
            Pour une vente réussie
          </p>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col items-end mt-8 lg:mt-0 w-full lg:w-auto">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            {/* Search input with button */}
            <div className="flex items-center bg-white rounded-full shadow-elevated overflow-hidden pr-1.5 py-1.5 pl-4">
              <MapPin className="h-5 w-5 text-[#2196F3] shrink-0 mr-2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Entrez l'adresse de votre bien"
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base py-2 min-w-0"
              />
              <button
                type="submit"
                className="bg-[#2196F3] hover:bg-[#1976D2] text-white font-medium px-4 md:px-6 py-2.5 md:py-3 rounded-full transition-colors duration-200 text-sm md:text-base whitespace-nowrap shrink-0"
              >
                Estimer mon bien
              </button>
            </div>

            {/* Feature tags */}
            <div className="flex items-center justify-center lg:justify-end gap-4 md:gap-6 mt-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-1.5 text-white text-sm"
                >
                  <Check className="h-4 w-4" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PropertyEstimationBanner

