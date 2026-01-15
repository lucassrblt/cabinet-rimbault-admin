"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface PropertyData {
  id: string
  reference: string
  title: string
  propertyType: string
  transactionType: string
  status: string
  isPublished: boolean
  createdAt: string
  finance?: {
    price: number
  } | null
  location?: {
    city: string
  } | null
  characteristics?: {
    surface: number
    rooms: number
  } | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DISPONIBLE: { label: "Disponible", className: "bg-green-50 text-green-700 border-green-200" },
  SOUS_COMPROMIS: { label: "Sous compromis", className: "bg-primary/10 text-primary border-primary/20" },
  SOUS_OFFRE: { label: "Sous offre", className: "bg-amber-50 text-amber-700 border-amber-200" },
  VENDU: { label: "Vendu", className: "bg-muted text-muted-foreground border-border" },
  LOUE: { label: "Loué", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ARCHIVE: { label: "Archivé", className: "bg-muted text-muted-foreground border-border" },
  BROUILLON: { label: "Brouillon", className: "bg-muted text-muted-foreground border-border" },
}

const typeLabels: Record<string, string> = {
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
  AUTRE: "Autre",
}

function formatPrice(price: number | undefined, transactionType: string) {
  if (!price) return "—"
  if (transactionType === "LOCATION" || transactionType === "LOCATION_SAISONNIERE") {
    return `${price.toLocaleString("fr-FR")} €/mois`
  }
  return `${price.toLocaleString("fr-FR")} €`
}

export default function PropertiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Charger les propriétés
  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties")
        
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des annonces")
        }

        const data = await response.json()
        setProperties(data)
        
        // Toast de succès uniquement au premier chargement
        if (data.length > 0) {
          toast({
            title: "Annonces chargées",
            description: `${data.length} annonce${data.length > 1 ? "s" : ""} trouvée${data.length > 1 ? "s" : ""}`,
          })
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les annonces. Vérifiez votre connexion et réessayez.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [toast])

  // Filtrer les propriétés
  const filteredProperties = properties.filter((property) => {
    // Filtre de recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = property.title.toLowerCase().includes(query)
      const matchesRef = property.reference.toLowerCase().includes(query)
      const matchesCity = property.location?.city?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesRef && !matchesCity) return false
    }

    // Filtre par type
    if (typeFilter !== "all" && property.propertyType !== typeFilter) {
      return false
    }

    // Filtre par statut
    if (statusFilter !== "all" && property.status !== statusFilter) {
      return false
    }

    return true
  })

  // Gérer le clic sur une ligne
  const handleRowClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  // Supprimer une propriété
  const handleDelete = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Trouver la propriété pour le message
    const propertyToDelete = properties.find(p => p.id === propertyId)
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${propertyToDelete?.title || "cette annonce"}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
      toast({
        title: "Annonce supprimée",
        description: `L'annonce "${propertyToDelete?.reference}" a été supprimée définitivement.`,
      })
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Échec de la suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'annonce. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Annonces</h1>
          <p className="text-muted-foreground mt-1">
            Gérez toutes vos annonces immobilières
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une annonce..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Type de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="APPARTEMENT">Appartement</SelectItem>
                <SelectItem value="MAISON">Maison</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="TERRAIN">Terrain</SelectItem>
                <SelectItem value="LOCAL_COMMERCIAL">Local commercial</SelectItem>
                <SelectItem value="BUREAUX">Bureaux</SelectItem>
                <SelectItem value="IMMEUBLE">Immeuble</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                <SelectItem value="SOUS_COMPROMIS">Sous compromis</SelectItem>
                <SelectItem value="SOUS_OFFRE">Sous offre</SelectItem>
                <SelectItem value="VENDU">Vendu</SelectItem>
                <SelectItem value="LOUE">Loué</SelectItem>
                <SelectItem value="BROUILLON">Brouillon</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">
            {isLoading ? (
              "Chargement..."
            ) : (
              `${filteredProperties.length} annonce${filteredProperties.length > 1 ? "s" : ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Aucune annonce trouvée</h3>
              <p className="text-muted-foreground mt-1">
                {properties.length === 0 
                  ? "Créez votre première annonce pour commencer"
                  : "Essayez de modifier vos critères de recherche"}
              </p>
              {properties.length === 0 && (
                <Link href="/properties/new" className="mt-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une annonce
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Réf.</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Titre</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prix</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ville</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Surface</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Publié</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow 
                    key={property.id} 
                    className="group cursor-pointer"
                    onClick={() => handleRowClick(property.id)}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {property.reference}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {property.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeLabels[property.propertyType] || property.propertyType}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatPrice(property.finance?.price, property.transactionType)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {property.location?.city || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {property.characteristics?.surface ? `${property.characteristics.surface} m²` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[property.status]?.className}
                      >
                        {statusConfig[property.status]?.label || property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          property.isPublished
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {property.isPublished ? "Oui" : "Non"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 shadow-elevated">
                          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide font-normal">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implémenter la vue publique
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/properties/${property.id}`)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/labels?propertyId=${property.id}`)
                            }}
                          >
                            <Tag className="mr-2 h-4 w-4" />
                            Générer étiquette
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => handleDelete(property.id, e)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
