import { PropertyCard, PropertyProps } from "./PropertyCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function LatestPropertiesSection() {
  const properties: PropertyProps[] = [
    {
      id: "1",
      title: "Charmante maison familiale avec jardin arboré",
      price: 325000,
      location: "Bordeaux, Chartrons",
      image: "https://images.unsplash.com/photo-1600596542815-2250c3855b81?q=80&w=2065&auto=format&fit=crop",
      beds: 4,
      baths: 2,
      surface: 145,
      type: "Maison",
      isNew: true
    },
    {
      id: "2",
      title: "Appartement T3 lumineux avec balcon filant",
      price: 245000,
      location: "Bordeaux, Bastide",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
      beds: 2,
      baths: 1,
      surface: 72,
      type: "Appartement"
    },
    {
      id: "3",
      title: "Échoppe bordelaise rénovée avec goût",
      price: 385000,
      location: "Bordeaux, Saint-Augustin",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop",
      beds: 3,
      baths: 2,
      surface: 110,
      type: "Maison",
      isNew: true
    },
    {
      id: "4",
      title: "Studio rénové idéal investissement locatif",
      price: 125000,
      location: "Bordeaux, Victoire",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
      beds: 1,
      baths: 1,
      surface: 28,
      type: "Appartement"
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-white" id="acheter">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 lg:mb-12 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#222222] mb-2">
              À la une dans votre quartier
            </h2>
            <p className="text-[#555555] text-base lg:text-lg">
              Découvrez nos dernières opportunités immobilières.
            </p>
          </div>
          
          <Link href="/biens" className="hidden lg:block">
            <Button 
              variant="outline" 
              className="border-[#780000] text-[#780000] hover:bg-[#780000] hover:text-white transition-all duration-200 font-medium h-10 px-5 rounded-[4px] gap-2"
            >
              Voir tous nos biens
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        {/* Mobile CTA */}
        <div className="mt-8 text-center lg:hidden">
          <Link href="/biens">
            <Button 
              variant="outline"
              className="border-[#780000] text-[#780000] hover:bg-[#780000] hover:text-white transition-all duration-200 font-medium h-11 px-6 rounded-[4px] gap-2"
            >
              Voir tous nos biens
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mt-14 lg:mt-20 py-8 px-6 lg:px-12 bg-[#F8F8F8] rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-[#780000] mb-1">150+</div>
              <div className="text-[#555555] text-sm">Biens vendus cette année</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-[#780000] mb-1">98%</div>
              <div className="text-[#555555] text-sm">Clients satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-[#780000] mb-1">45j</div>
              <div className="text-[#555555] text-sm">Délai moyen de vente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-[#780000] mb-1">28</div>
              <div className="text-[#555555] text-sm">Années d'expertise</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
