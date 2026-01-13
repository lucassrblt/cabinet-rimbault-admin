import { Building2, Eye, Tag, TrendingUp, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Ces données seront remplacées par des vraies données de la base
const stats = [
  {
    name: "Total annonces",
    value: "24",
    change: "+2 ce mois",
    icon: Building2,
  },
  {
    name: "Annonces publiées",
    value: "18",
    change: "75% du total",
    icon: Eye,
  },
  {
    name: "Sous compromis",
    value: "4",
    change: "+1 cette semaine",
    icon: TrendingUp,
  },
  {
    name: "Étiquettes générées",
    value: "45",
    change: "+5 ce mois",
    icon: Tag,
  },
]

const recentProperties = [
  {
    id: "1",
    title: "Appartement T3 Centre-ville",
    type: "Appartement",
    price: "189 000 €",
    status: "Disponible",
    city: "Lyon",
  },
  {
    id: "2",
    title: "Maison avec jardin",
    type: "Maison",
    price: "345 000 €",
    status: "Sous compromis",
    city: "Villeurbanne",
  },
  {
    id: "3",
    title: "Studio meublé",
    type: "Appartement",
    price: "650 €/mois",
    status: "Disponible",
    city: "Lyon",
  },
]

export default function DashboardPage() {
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
        <Link href="/admin/properties/new">
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
          <Link href="/admin/properties">
            <Button variant="outline" size="sm" className="text-xs">
              Voir tout
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recentProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.type} • {property.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{property.price}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      property.status === "Disponible"
                        ? "bg-green-50 text-green-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/properties/new" className="block">
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

        <Link href="/admin/labels" className="block">
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

        <Link href="/admin/properties" className="block">
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
