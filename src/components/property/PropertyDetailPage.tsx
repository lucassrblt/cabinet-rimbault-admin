"use client"

import * as React from "react"
import { useState } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Heart, 
  Share2,
  Home,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyEstimationBanner } from "@/components/PropertyEstimationBanner"
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PropertyData {
  id: string
  title: string
  reference: string
  price: number
  description: string
  location: {
    city: string
    postalCode: string
    address?: string
    latitude?: number
    longitude?: number
  }
  characteristics: {
    surface: number
    surfaceCarrez?: number
    rooms: number
    bedrooms: number
    bathrooms: number
    floor?: number
    totalFloors?: number
    yearBuilt?: number
    condition?: string
  }
  energy: {
    dpeClass?: string
    dpeValue?: number
    gesClass?: string
    gesValue?: number
    dpeImageUrl?: string | null
    gesImageUrl?: string | null
  }
  copro?: {
    lots?: number
    charges?: number
  }
  images: string[]
  isExclusive?: boolean
  isNew?: boolean
}

interface PropertyDetailPageProps {
  property?: PropertyData
  otherProperties?: PropertyData[]
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA FOR DEMO
// ═══════════════════════════════════════════════════════════════════════════════

const sampleProperty: PropertyData = {
  id: "1",
  title: "Appartement de plain-pied, en RDC d'une maison, à vendre à SEYSSEL (01), avec terrasse, à 40 mn d'Aix-les-Bains, 50 mn de Genève et 1H30 de Lyon.",
  reference: "340 938 225 778",
  price: 170000,
  description: `Appartement lumineux de plain-pied situé en rez-de-chaussée d'une maison, au sein d'une petite copropriété de seulement cinq lots.

Il se compose d'une entrée, d'une cuisine ouverte sur un agréable séjour, de deux chambres, d'une salle d'eau avec WC, et d'un espace de rangement.

L'ensemble est complété par un balcon et une terrasse, offrant un cadre de vie confortable.

Parking communal gratuit juste à côté.

Pas de garage.

A proximité des commodités, de la base de loisirs et de la gare.

Situation idéale :
• 40 minutes d'Aix-les-Bains
• 50 minutes de Genève
• 1h30 de Lyon

Pour tout complément d'information et pour organiser une visite, n'hésitez pas à me contacter.`,
  location: {
    city: "SEYSSEL",
    postalCode: "01420",
    latitude: 45.9587,
    longitude: 5.8332
  },
  characteristics: {
    surface: 66,
    surfaceCarrez: 66.20,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 0,
    totalFloors: 3
  },
  energy: {
    dpeClass: "D",
    dpeValue: 180,
    gesClass: "C",
    gesValue: 25
  },
  copro: {
    lots: 5,
    charges: 0
  },
  images: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560185008-a33f5c7b1844?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560185009-ddddb7618d83?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560449752-3fd4bdbe7df0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80"
  ],
  isExclusive: true,
  isNew: true
}

const sampleOtherProperties: PropertyData[] = [
  {
    id: "2",
    title: "Appartement T3 de 67,31m² à vendre à SEYSSEL (01) avec terrasse et proche du Rhône. En train à 1 heure de Lyon et 45 mn de Genève",
    reference: "REF-002",
    price: 223900,
    description: "",
    location: { city: "SEYSSEL", postalCode: "01420" },
    characteristics: { surface: 67, rooms: 3, bedrooms: 2, bathrooms: 1 },
    energy: { dpeClass: "B" },
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"]
  },
  {
    id: "3",
    title: "Appartement de 32,36 m² à vendre, 2 pièces à SEYSSEL (01) à 45 mns d'Annecy et de Genève",
    reference: "REF-003",
    price: 119700,
    description: "",
    location: { city: "SEYSSEL", postalCode: "01420" },
    characteristics: { surface: 32, rooms: 2, bedrooms: 1, bathrooms: 1 },
    energy: { dpeClass: "C" },
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"]
  },
  {
    id: "4",
    title: "Appartement de 86,40 m² à vendre à SEYSSEL (01) avec terrasse, proche du Rhône, à 45 mns d'Annecy et de Genève",
    reference: "REF-004",
    price: 287000,
    description: "",
    location: { city: "SEYSSEL", postalCode: "01420" },
    characteristics: { surface: 86, rooms: 4, bedrooms: 3, bathrooms: 1 },
    energy: { dpeClass: "B" },
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"]
  }
]

// ═══════════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Image Carousel Component
function ImageCarousel({ images, className }: { images: string[], className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={cn("relative group rounded-2xl overflow-hidden bg-slate-100", className)}>
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
        />
        
        {/* Photo count badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
          <ImageIcon className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">+ {images.length} photos</span>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Image précédente"
        >
          <ChevronLeft className="h-6 w-6 text-slate-700" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Image suivante"
        >
          <ChevronRight className="h-6 w-6 text-slate-700" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.slice(0, 7).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
              )}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
          {images.length > 7 && (
            <span className="text-white text-xs ml-1">+{images.length - 7}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Energy Label Component (DPE/GES)
function EnergyLabel({ 
  type, 
  value, 
  className 
}: { 
  type: "dpe" | "ges"
  value?: string
  className?: string 
}) {
  const classes = ["A", "B", "C", "D", "E", "F", "G"]
  const dpeColors: Record<string, string> = {
    A: "bg-[#319834]",
    B: "bg-[#33a357]",
    C: "bg-[#51b14f]",
    D: "bg-[#f0e60d]",
    E: "bg-[#f5b30b]",
    F: "bg-[#ef7e22]",
    G: "bg-[#e42016]"
  }
  const gesColors: Record<string, string> = {
    A: "bg-[#f2e9f9]",
    B: "bg-[#d9c1eb]",
    C: "bg-[#c59dde]",
    D: "bg-[#a974c8]",
    E: "bg-[#8f50b4]",
    F: "bg-[#6f2c91]",
    G: "bg-[#4a0072]"
  }
  
  const colors = type === "dpe" ? dpeColors : gesColors
  const title = type === "dpe" ? "Consommation énergétique" : "Émissions de gaz à effet de serre"
  const unit = type === "dpe" ? "kWh/m²/an" : "kgCO₂/m²/an"

  return (
    <div className={cn("", className)}>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      <div className="space-y-1">
        {classes.map((cls) => (
          <div key={cls} className="flex items-center gap-2">
            <div
              className={cn(
                "h-6 flex items-center justify-center text-xs font-bold text-white rounded-r-md transition-all",
                colors[cls],
                cls === value ? "px-4 min-w-[80px] ring-2 ring-slate-800 ring-offset-1" : "px-2 min-w-[40px] opacity-60"
              )}
              style={{ width: cls === value ? "auto" : `${(classes.indexOf(cls) + 2) * 12}px` }}
            >
              {cls}
            </div>
            {cls === value && (
              <span className="text-xs font-medium text-slate-600">{unit}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Property Card for "Other Properties" section
function PropertyCard({ property }: { property: PropertyData }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer border-0 shadow-card">
      {/* Agent badge */}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-xs text-slate-600">Présenté par</span>
          <span className="text-xs font-semibold text-slate-800">Flora</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 overflow-hidden relative">
            <Image 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Agent"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="aspect-[16/10] overflow-hidden relative">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <CardContent className="p-5">
        {/* Location & Price */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-semibold text-[#1e4a8a]">
            {property.location.city} {property.location.postalCode}
          </span>
          <span className="text-lg font-bold text-slate-800">
            {property.price.toLocaleString("fr-FR")}€
          </span>
        </div>

        {/* Title */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 min-h-[60px]">
          {property.title}
        </p>

        {/* Surface */}
        <div className="flex items-center justify-center gap-2 py-3 border-t border-slate-100">
          <Maximize className="h-5 w-5 text-slate-400" />
          <span className="text-base font-semibold text-slate-700">
            {property.characteristics.surface} m²
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// FAQ Wireframe Component
function FAQWireframe() {
  const faqItems = [
    "Comment financer l'achat de ce bien ?",
    "Quels sont les frais de notaire estimés ?",
    "Puis-je visiter le bien ?",
    "Le bien est-il négociable ?",
    "Quelles sont les charges de copropriété ?"
  ]

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50/50">
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-3">
          WIREFRAME
        </span>
        <h2 className="text-2xl font-bold text-slate-800">
          Foire aux questions
        </h2>
        <p className="text-slate-500 mt-2">Cette section sera implémentée ultérieurement</p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {faqItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
          >
            <span className="text-slate-600">{item}</span>
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Footer Wireframe Component
function FooterWireframe() {
  return (
    <div className="border-2 border-dashed border-slate-300 rounded-t-2xl bg-slate-800/95 text-white">
      <div className="text-center py-4 border-b border-slate-600">
        <span className="inline-block px-4 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full">
          WIREFRAME - FOOTER
        </span>
      </div>
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="w-32 h-10 bg-slate-600 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-600 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-slate-600 rounded animate-pulse" />
              <div className="w-1/2 h-3 bg-slate-600 rounded animate-pulse" />
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-300">Navigation</h4>
            <div className="space-y-2">
              {["Acheter", "Vendre", "Louer", "L'agence"].map((item) => (
                <div key={item} className="text-slate-400 text-sm">{item}</div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-300">Services</h4>
            <div className="space-y-2">
              {["Estimation", "Gestion locative", "Syndic", "Conseil"].map((item) => (
                <div key={item} className="text-slate-400 text-sm">{item}</div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-300">Contact</h4>
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-600 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-slate-600 rounded animate-pulse" />
              <div className="w-1/2 h-3 bg-slate-600 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2026 Cabinet Rimbault. Tous droits réservés.
          </div>
          <div className="flex gap-6 text-slate-400 text-sm">
            <span>Mentions légales</span>
            <span>Politique de confidentialité</span>
            <span>CGV</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mapbox Interactive Map Component
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

function MapSection({ 
  city, 
  postalCode, 
  latitude, 
  longitude,
  title 
}: { 
  city: string
  postalCode: string
  latitude?: number
  longitude?: number
  title: string
}) {
  // Default coordinates (center of France) if no coordinates provided
  const defaultLat = 46.603354
  const defaultLng = 1.888334
  
  const lat = latitude || defaultLat
  const lng = longitude || defaultLng
  const hasCoordinates = latitude && longitude

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">
        Localisation du bien : {title.split(',')[0]}
      </h2>
      <p className="text-slate-600 font-medium">
        {postalCode} {city}
      </p>
      
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card">
        <div className="aspect-[2/1] bg-gradient-to-br from-green-100 via-green-50 to-blue-50 relative">
          {MAPBOX_TOKEN ? (
            <Map
              initialViewState={{
                latitude: lat,
                longitude: lng,
                zoom: 11, // Zoom large pour voir la zone
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              interactive={true}
              scrollZoom={true}
              dragPan={true}
              dragRotate={false}
              doubleClickZoom={true}
              touchZoomRotate={true}
            >
              <NavigationControl position="top-right" />
              
              {hasCoordinates && (
                <Marker latitude={lat} longitude={lng} anchor="bottom">
                  <div className="relative animate-bounce">
                    <div className="w-10 h-10 bg-[#1e4a8a] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e4a8a] rotate-45 border-r border-b border-white" />
                  </div>
                </Marker>
              )}
            </Map>
          ) : (
            // Fallback when no Mapbox token is configured
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-30" />
              
              {/* Map pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <div className="relative">
                  <div className="w-10 h-10 bg-[#1e4a8a] rounded-full flex items-center justify-center shadow-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e4a8a] rotate-45" />
                </div>
              </div>

              {/* Placeholder notice */}
              <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-sm text-slate-600">
                <span className="font-medium">📍 {city}</span>
                <p className="text-xs text-slate-500 mt-1">
                  Configurez NEXT_PUBLIC_MAPBOX_TOKEN pour afficher la carte
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PropertyDetailPage({
  property = sampleProperty,
  otherProperties = sampleOtherProperties,
  className
}: PropertyDetailPageProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("fr-FR")
  }

  const generalCharacteristics = [
    { label: "Référence", value: property.reference },
    { label: "Nb chambre(s)", value: property.characteristics.bedrooms },
    { label: "Nb de pièce(s)", value: property.characteristics.rooms },
    { label: "Surface habitable", value: `${property.characteristics.surface} m²` },
    { label: "Surface carrez", value: property.characteristics.surfaceCarrez ? `${property.characteristics.surfaceCarrez.toFixed(2).replace('.', ',')} m²` : "-" },
    { label: "Salle de bain / eau", value: property.characteristics.bathrooms },
    { label: "Nb d'étages", value: property.characteristics.totalFloors || "-" },
  ]

  return (
    <div className={cn("min-h-screen bg-slate-50", className)}>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* BREADCRUMB */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Accueil</a>
            <ChevronRight className="h-4 w-4" />
            <a href="#" className="hover:text-primary transition-colors">Vente</a>
            <ChevronRight className="h-4 w-4" />
            <a href="#" className="hover:text-primary transition-colors">Appartement</a>
            <ChevronRight className="h-4 w-4" />
            <a href="#" className="hover:text-primary transition-colors">Ain (01)</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-400 truncate max-w-xs">{property.location.city}</span>
          </nav>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Image Carousel */}
            <div className="relative">
              <ImageCarousel images={property.images} />
              
              {/* Badges */}
              <div className="absolute bottom-6 left-6 flex gap-2">
                {property.isExclusive && (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-1.5 text-sm font-semibold">
                    Exclusivité
                  </Badge>
                )}
                {property.isNew && (
                  <Badge className="bg-amber-400 text-slate-800 hover:bg-amber-500 px-4 py-1.5 text-sm font-semibold">
                    Nouveauté
                  </Badge>
                )}
              </div>
            </div>

            {/* Right - Property Info */}
            <div className="flex flex-col">
              {/* Action buttons */}
              <div className="flex justify-end gap-3 mb-6">
                <Button variant="ghost" size="icon" className="rounded-full w-11 h-11 border border-slate-200">
                  <Heart className="h-5 w-5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full w-11 h-11 border border-slate-200">
                  <Share2 className="h-5 w-5 text-slate-500" />
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-[#1e4a8a] mb-4">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold text-lg">
                  {property.location.city} {property.location.postalCode}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-8">
                {property.title}
              </h1>

              {/* Key Features */}
              <div className="flex items-center gap-8 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bath className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Salles de bain</div>
                    <div className="text-xl font-bold text-slate-800">{property.characteristics.bathrooms}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Maximize className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Superficie</div>
                    <div className="text-xl font-bold text-slate-800">{property.characteristics.surface} m²</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bed className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Chambres</div>
                    <div className="text-xl font-bold text-slate-800">{property.characteristics.bedrooms}</div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-6 mt-auto">
                <div className="text-4xl lg:text-5xl font-bold text-slate-800">
                  {formatPrice(property.price)}€
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DESCRIPTION SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Présentation du bien : Appartement {property.characteristics.rooms} pièces à vendre à {property.location.city}
          </h2>
          
          <div className="prose prose-slate max-w-none">
            {property.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-600 leading-relaxed mb-4">
                {paragraph.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            ))}
          </div>

          {/* Copro Info */}
          {property.copro && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                <span className="text-[#1e4a8a]">●</span>{" "}
                Nombre de lots de la copropriété : {property.copro.lots}, 
                Montant moyen annuel de la quote-part de charges (budget prévisionnel) : {property.copro.charges}€ soit {Math.round((property.copro.charges || 0) / 12)}€ par mois. 
                Les honoraires sont à la charge du vendeur.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Les informations sur les risques auxquels ce bien est exposé sont disponibles sur le site Géorisques : www.georisques.gouv.fr.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LOCATION SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <MapSection
            city={property.location.city}
            postalCode={property.location.postalCode}
            latitude={property.location.latitude}
            longitude={property.location.longitude}
            title={`Appartement ${property.characteristics.surface} m² à vendre à ${property.location.city}`}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CHARACTERISTICS SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">
            Caractéristiques du bien :
          </h2>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-auto p-0 mb-8">
              <TabsTrigger 
                value="general"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e4a8a] data-[state=active]:bg-transparent data-[state=active]:text-[#1e4a8a] data-[state=active]:shadow-none px-6 py-3 font-semibold"
              >
                Générales
              </TabsTrigger>
              <TabsTrigger 
                value="diagnostics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e4a8a] data-[state=active]:bg-transparent data-[state=active]:text-[#1e4a8a] data-[state=active]:shadow-none px-6 py-3 font-semibold"
              >
                Diagnostics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-0">
              <div className="space-y-0">
                {generalCharacteristics.map((item, index) => (
                  <div 
                    key={item.label}
                    className={cn(
                      "flex justify-between items-center py-4 px-6",
                      index % 2 === 0 ? "bg-slate-50" : "bg-white"
                    )}
                  >
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-slate-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="mt-0">
              {/* Images générées depuis l'API */}
              {(property.energy.dpeImageUrl || property.energy.gesImageUrl) ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {property.energy.dpeImageUrl && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Diagnostic de Performance Énergétique (DPE)</h4>
                        <div className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <Image
                            src={property.energy.dpeImageUrl}
                            alt="Étiquette DPE"
                            fill
                            className="object-contain"
                          />
                        </div>
                        {property.energy.dpeValue && (
                          <p className="text-sm text-slate-600 text-center">
                            <strong>{property.energy.dpeValue}</strong> kWh/m²/an
                          </p>
                        )}
                      </div>
                    )}
                    {property.energy.gesImageUrl && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Émissions de Gaz à Effet de Serre (GES)</h4>
                        <div className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <Image
                            src={property.energy.gesImageUrl}
                            alt="Étiquette GES"
                            fill
                            className="object-contain"
                          />
                        </div>
                        {property.energy.gesValue && (
                          <p className="text-sm text-slate-600 text-center">
                            <strong>{property.energy.gesValue}</strong> kgCO₂/m²/an
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback vers les étiquettes simplifiées si pas d'images générées */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6">
                  <EnergyLabel type="dpe" value={property.energy.dpeClass} />
                  <EnergyLabel type="ges" value={property.energy.gesClass} />
                </div>
              )}
              
              {property.energy.dpeValue && property.energy.gesValue && !property.energy.dpeImageUrl && !property.energy.gesImageUrl && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">
                    <strong>DPE :</strong> {property.energy.dpeValue} kWh/m²/an • 
                    <strong className="ml-4">GES :</strong> {property.energy.gesValue} kgCO₂/m²/an
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* OTHER PROPERTIES SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">
            Autres biens de l&apos;agence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FAQ WIREFRAME */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <FAQWireframe />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ESTIMATION BANNER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <PropertyEstimationBanner 
            onEstimate={(address) => console.log("Estimation requested for:", address)}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER WIREFRAME */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <FooterWireframe />
    </div>
  )
}

export default PropertyDetailPage

