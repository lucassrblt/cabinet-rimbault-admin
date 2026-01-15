import { MapPin, Heart, TrendingUp, Award, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "Experts du quartier",
      description: "Nous connaissons chaque rue, chaque école et chaque commerce. Notre expertise locale est votre meilleur atout."
    },
    {
      icon: Heart,
      title: "Accompagnement complet",
      description: "De la première visite à la signature chez le notaire, nous sommes à vos côtés à chaque étape."
    },
    {
      icon: TrendingUp,
      title: "Estimations justes",
      description: "Pas de surévaluation. Nous vous donnons le vrai prix du marché pour vendre rapidement et sereinement."
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-[#F5F5F5]" id="agence">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#222222] mb-3">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-[#555555] text-base lg:text-lg">
            Une agence à taille humaine, proche de vous et de vos projets de vie.
          </p>
        </div>

        {/* Features Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 lg:p-8 bg-white rounded-lg"
            >
              {/* Icon - Trait fin, couleur bordeaux */}
              <div className="w-14 h-14 rounded-full bg-[#780000]/5 flex items-center justify-center mb-5">
                <feature.icon 
                  size={26} 
                  strokeWidth={1.5} 
                  className="text-[#780000]" 
                />
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-[#222222] mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-[#555555] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section - Vendre */}
        <div className="relative rounded-lg overflow-hidden bg-[#780000]">
          {/* Content */}
          <div className="relative z-10 py-12 lg:py-16 px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left max-w-lg">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                  Vous souhaitez vendre votre bien ?
                </h3>
                <p className="text-white/80 text-base">
                  Obtenez une estimation gratuite et sans engagement en moins de 24h.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="bg-white text-[#780000] hover:bg-gray-100 font-medium h-11 px-6 rounded-[4px] shadow-none transition-all duration-200"
                >
                  Estimation gratuite
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium h-11 px-6 rounded-[4px] transition-all duration-200"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 lg:gap-12">
          <div className="flex items-center gap-2.5 text-[#555555]">
            <Award size={20} strokeWidth={1.5} className="text-[#780000]" />
            <span className="font-medium text-sm">Certifié FNAIM</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#555555]">
            <Users size={20} strokeWidth={1.5} className="text-[#780000]" />
            <span className="font-medium text-sm">+2000 clients accompagnés</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#555555]">
            <Clock size={20} strokeWidth={1.5} className="text-[#780000]" />
            <span className="font-medium text-sm">Disponible 7j/7</span>
          </div>
        </div>
      </div>
    </section>
  )
}
