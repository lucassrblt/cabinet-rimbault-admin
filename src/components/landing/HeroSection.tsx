"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Euro, Home } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[620px] lg:min-h-[680px] w-full flex items-center justify-center overflow-hidden pt-[72px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/55 z-10" />
        {/* High quality neighborhood image - French street scene */}
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
          alt="Belle rue parisienne avec architecture typique française"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container relative z-20 px-4 lg:px-8 flex flex-col items-center gap-8 py-16 lg:py-20">
        {/* Badge - Ancrage local */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full animate-fade-in">
          <div className="w-1.5 h-1.5 bg-[#780000] rounded-full" />
          <span className="text-white/90 text-sm font-medium">Votre agence de proximité depuis 1995</span>
        </div>

        {/* Main Title */}
        <div className="text-center max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Votre expert immobilier
            <br />
            à Bordeaux.
          </h1>
          <p className="text-white/75 text-base sm:text-lg md:text-xl max-w-xl mx-auto font-normal leading-relaxed">
            Trouvez le bien de vos rêves dans votre quartier, accompagné par une équipe qui connaît chaque rue.
          </p>
        </div>

        {/* Search Bar - Floating Card */}
        <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-lg shadow-xl">
            <div className="flex flex-col md:flex-row items-stretch">
              
              {/* Type Selection */}
              <div className="flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Home size={14} className="text-gray-400" />
                  <span className="text-[11px] uppercase tracking-wide font-medium text-[#555555]">
                    Type de bien
                  </span>
                </div>
                <Select>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-base font-medium text-[#222222] shadow-none bg-transparent [&>svg]:text-gray-400">
                    <SelectValue placeholder="Appartement, Maison..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-lg">
                    <SelectItem value="tous" className="cursor-pointer focus:bg-gray-50">Tous les biens</SelectItem>
                    <SelectItem value="appartement" className="cursor-pointer focus:bg-gray-50">Appartement</SelectItem>
                    <SelectItem value="maison" className="cursor-pointer focus:bg-gray-50">Maison</SelectItem>
                    <SelectItem value="terrain" className="cursor-pointer focus:bg-gray-50">Terrain</SelectItem>
                    <SelectItem value="parking" className="cursor-pointer focus:bg-gray-50">Parking / Garage</SelectItem>
                    <SelectItem value="commerce" className="cursor-pointer focus:bg-gray-50">Local commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-[11px] uppercase tracking-wide font-medium text-[#555555]">
                    Localisation
                  </span>
                </div>
                <Input 
                  type="text" 
                  placeholder="Quartier, ville..." 
                  className="border-0 p-0 h-auto focus-visible:ring-0 text-base font-medium text-[#222222] shadow-none placeholder:text-gray-400 bg-transparent"
                  aria-label="Entrez un quartier ou une ville"
                />
              </div>

              {/* Budget */}
              <div className="flex-1 px-5 py-4 border-b md:border-b-0 border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Euro size={14} className="text-gray-400" />
                  <span className="text-[11px] uppercase tracking-wide font-medium text-[#555555]">
                    Budget max
                  </span>
                </div>
                <Select>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 text-base font-medium text-[#222222] shadow-none bg-transparent [&>svg]:text-gray-400">
                    <SelectValue placeholder="Votre budget" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100 shadow-lg rounded-lg">
                    <SelectItem value="100000" className="cursor-pointer focus:bg-gray-50">100 000 €</SelectItem>
                    <SelectItem value="150000" className="cursor-pointer focus:bg-gray-50">150 000 €</SelectItem>
                    <SelectItem value="200000" className="cursor-pointer focus:bg-gray-50">200 000 €</SelectItem>
                    <SelectItem value="250000" className="cursor-pointer focus:bg-gray-50">250 000 €</SelectItem>
                    <SelectItem value="300000" className="cursor-pointer focus:bg-gray-50">300 000 €</SelectItem>
                    <SelectItem value="400000" className="cursor-pointer focus:bg-gray-50">400 000 €</SelectItem>
                    <SelectItem value="500000" className="cursor-pointer focus:bg-gray-50">500 000 €+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="p-3 flex items-center">
                <Button 
                  className="w-full md:w-auto bg-[#780000] hover:bg-[#5c0000] text-white h-12 px-6 rounded-[4px] font-medium flex items-center justify-center gap-2 shadow-none transition-all duration-200 hover:shadow-md"
                  aria-label="Lancer la recherche"
                >
                  <Search size={18} />
                  <span className="md:hidden lg:inline">Rechercher</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <button 
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium transition-all"
              aria-label="Filtrer par appartements T2/T3"
            >
              Appartements T2/T3
            </button>
            <button 
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium transition-all"
              aria-label="Filtrer par maisons avec jardin"
            >
              Maisons avec jardin
            </button>
            <button 
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium transition-all"
              aria-label="Filtrer par budget moins de 250 000 €"
            >
              Moins de 250 000 €
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator - subtle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
