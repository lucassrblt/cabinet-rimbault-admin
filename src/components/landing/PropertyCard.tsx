import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react"

export interface PropertyProps {
  id: string
  title: string
  price: number
  location: string
  image: string
  beds: number
  baths: number
  surface: number
  type: string
  isNew?: boolean
}

export function PropertyCard({ property }: { property: PropertyProps }) {
  return (
    <article className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 flex flex-col h-full hover:shadow-card">
      {/* Image Container */}
      <div className="relative h-52 lg:h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white text-[#222222] hover:bg-white font-medium text-xs px-2.5 py-1 shadow-sm border-0 rounded-[4px]">
            {property.type}
          </Badge>
          {property.isNew && (
            <Badge className="bg-[#780000] text-white hover:bg-[#780000] font-medium text-xs px-2.5 py-1 shadow-sm border-0 rounded-[4px]">
              Nouveau
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 group/fav"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={16} className="text-gray-400 group-hover/fav:text-[#780000] transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5 flex flex-col flex-grow">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-[#555555] mb-2">
          <MapPin size={13} className="text-[#780000]" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[#222222] mb-3 line-clamp-2 group-hover:text-[#780000] transition-colors leading-snug">
          <Link href={`/bien/${property.id}`} className="hover:underline">
            {property.title}
          </Link>
        </h3>

        {/* Price - en rouge bordeaux, très visible */}
        <div className="text-xl lg:text-2xl font-bold text-[#780000] mb-4">
          {property.price.toLocaleString('fr-FR')} €
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-[#555555] mt-auto">
          <div className="flex items-center gap-1.5" title={`${property.beds} Chambres`}>
            <Bed size={15} className="text-gray-400" />
            <span className="text-sm">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`${property.baths} Salles de bain`}>
            <Bath size={15} className="text-gray-400" />
            <span className="text-sm">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`${property.surface} m²`}>
            <Maximize size={15} className="text-gray-400" />
            <span className="text-sm">{property.surface} m²</span>
          </div>
        </div>
      </div>
    </article>
  )
}
