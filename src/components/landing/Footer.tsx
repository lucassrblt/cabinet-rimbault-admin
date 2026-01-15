import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#222222] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 bg-[#780000] rounded-[4px] flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white leading-tight">
                  Cabinet Rimbault
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                  Immobilier
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Votre partenaire immobilier de confiance à Bordeaux depuis 1995. Nous vous accompagnons dans tous vos projets.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#780000] flex items-center justify-center transition-colors duration-200"
                aria-label="Suivez-nous sur Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#780000] flex items-center justify-center transition-colors duration-200"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#780000] flex items-center justify-center transition-colors duration-200"
                aria-label="Suivez-nous sur LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#acheter" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Acheter un bien
                </Link>
              </li>
              <li>
                <Link href="#louer" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Louer un bien
                </Link>
              </li>
              <li>
                <Link href="#vendre" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Vendre mon bien
                </Link>
              </li>
              <li>
                <Link href="#estimation" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Estimation gratuite
                </Link>
              </li>
              <li>
                <Link href="#agence" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Notre agence
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm">Nos services</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Gestion locative
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Syndic de copropriété
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Conseil en investissement
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Accompagnement juridique
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} strokeWidth={1.5} className="text-[#780000] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  12 Cours de l'Intendance<br />
                  33000 Bordeaux
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} strokeWidth={1.5} className="text-[#780000] flex-shrink-0" />
                <a href="tel:+33556000000" className="text-gray-400 hover:text-white transition-colors text-sm">
                  05 56 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} strokeWidth={1.5} className="text-[#780000] flex-shrink-0" />
                <a href="mailto:contact@cabinet-rimbault.fr" className="text-gray-400 hover:text-white transition-colors text-sm">
                  contact@cabinet-rimbault.fr
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={16} strokeWidth={1.5} className="text-[#780000] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Lun - Ven : 9h - 19h<br />
                  Sam : 9h - 12h
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-sm">
              © {currentYear} Cabinet Rimbault. Tous droits réservés.
            </p>
            <div className="flex gap-5">
              <Link href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                Mentions légales
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                Confidentialité
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
