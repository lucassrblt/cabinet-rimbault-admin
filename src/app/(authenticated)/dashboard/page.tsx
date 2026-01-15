import { Building2, Eye, Tag, TrendingUp, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { PropertyStatus, PropertyType, TransactionType } from "@prisma/client"

// Fonction pour formater le prix
function formatPrice(price: number, transactionType: TransactionType): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
  
  if (transactionType === 'LOCATION' || transactionType === 'LOCATION_SAISONNIERE') {
    return `${formatted}/mois`
  }
  return formatted
}

// Fonction pour traduire le type de bien
function translatePropertyType(type: PropertyType): string {
  const translations: Record<PropertyType, string> = {
    APPARTEMENT: "Appartement",
    MAISON: "Maison",
    VILLA: "Villa",
    TERRAIN: "Terrain",
    LOCAL_COMMERCIAL: "Local commercial",
    BUREAUX: "Bureaux",
    IMMEUBLE: "Immeuble",
    PARKING: "Parking",
    CAVE: "Cave",
    LOFT: "Loft",
    ATELIER: "Atelier",
    FERME: "Ferme",
    CHATEAU: "Château",
    PROPRIETE: "Propriété",
    AUTRE: "Autre",
  }
  return translations[type] || type
}

// Fonction pour traduire le statut
function translateStatus(status: PropertyStatus): string {
  const translations: Record<PropertyStatus, string> = {
    DISPONIBLE: "Disponible",
    SOUS_COMPROMIS: "Sous compromis",
    SOUS_OFFRE: "Sous offre",
    VENDU: "Vendu",
    LOUE: "Loué",
    ARCHIVE: "Archivé",
    BROUILLON: "Brouillon",
  }
  return translations[status] || status
}

export default async function DashboardPage() {

  const [
    totalProperties,
    publishedProperties,
    sousCompromis,
    labelsGenerated,
    recentProperties,
  ] = await Promise.all([
    // Total des annonces
    prisma.property.count(),
    // Annonces publiées
    prisma.property.count({
      where: { isPublished: true },
    }),
    // Sous compromis
    prisma.property.count({
      where: { status: 'SOUS_COMPROMIS' },
    }),
    // Étiquettes générées (via PropertyEnergy)
    prisma.propertyEnergy.count({
      where: { labelGenerated: true },
    }),
    // 5 dernières annonces avec leurs relations (délai de 2s pour tester le skeleton)
    prisma.property.findMany({
      take: 5,  
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        finance: true,
      },
    }),
  ])

  // Calculer les pourcentages
  const publishedPercentage = totalProperties > 0 
    ? Math.round((publishedProperties / totalProperties) * 100) 
    : 0

  const stats = [
    {
      name: "Total annonces",
      value: totalProperties.toString(),
      change: totalProperties === 0 ? "Aucune annonce" : `${totalProperties} annonce${totalProperties > 1 ? 's' : ''}`,
      icon: Building2,
    },
    {
      name: "Annonces publiées",
      value: publishedProperties.toString(),
      change: `${publishedPercentage}% du total`,
      icon: Eye,
    },
    {
      name: "Sous compromis",
      value: sousCompromis.toString(),
      change: sousCompromis === 0 ? "Aucun" : `${sousCompromis} bien${sousCompromis > 1 ? 's' : ''}`,
      icon: TrendingUp,
    },
    {
      name: "Étiquettes générées",
      value: labelsGenerated.toString(),
      change: labelsGenerated === 0 ? "Aucune étiquette" : `${labelsGenerated} étiquette${labelsGenerated > 1 ? 's' : ''}`,
      icon: Tag,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue sur votre espace d&apos;administration
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="shadow-sm">
            <Building2 className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{stat.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Properties */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Annonces récentes</CardTitle>
            <CardDescription className="text-sm">
              Les dernières annonces ajoutées ou modifiées
            </CardDescription>
          </div>
          <Link href="/properties">
            <Button variant="outline" size="sm" className="text-xs">
              Voir tout
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune annonce pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez votre première annonce pour commencer
              </p>
              <Link href="/properties/new" className="mt-4">
                <Button variant="outline" size="sm">
                  Créer une annonce
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {translatePropertyType(property.propertyType)} • {property.location?.city || "Ville non renseignée"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {property.finance?.price 
                        ? formatPrice(property.finance.price, property.transactionType)
                        : "Prix non renseigné"
                      }
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        property.status === "DISPONIBLE"
                          ? "bg-green-50 text-green-700"
                          : property.status === "SOUS_COMPROMIS" || property.status === "SOUS_OFFRE"
                          ? "bg-primary/10 text-primary"
                          : property.status === "VENDU" || property.status === "LOUE"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {translateStatus(property.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/properties/new" className="block">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ajouter une annonce</p>
                  <p className="text-sm text-muted-foreground">Créer une nouvelle annonce</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/labels" className="block">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary group-hover:bg-muted transition-colors">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Générer des étiquettes</p>
                  <p className="text-sm text-muted-foreground">Créer des étiquettes vitrine</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/properties" className="block">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary group-hover:bg-muted transition-colors">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Gérer les annonces</p>
                  <p className="text-sm text-muted-foreground">Modifier et publier</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
