"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, MoreHorizontal, Eye, Trash2, Loader2, MapPin, Phone, Mail, Calendar, Home } from "lucide-react"
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

interface EvaluationData {
  id: string
  propertyType: string
  postalCode: string
  address: string | null
  surface: string | null
  rooms: string | null
  bedrooms: string | null
  situation: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NOUVELLE: { label: "Nouvelle", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_COURS: { label: "En cours", className: "bg-amber-50 text-amber-700 border-amber-200" },
  TRAITEE: { label: "Traitée", className: "bg-green-50 text-green-700 border-green-200" },
  ARCHIVEE: { label: "Archivée", className: "bg-muted text-muted-foreground border-border" },
}

const situationConfig: Record<string, { label: string; className: string }> = {
  ACHAT: { label: "Achat", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VENTE: { label: "Vente", className: "bg-violet-50 text-violet-700 border-violet-200" },
  RENSEIGNEMENT: { label: "Renseignement", className: "bg-slate-50 text-slate-700 border-slate-200" },
}

const propertyTypeLabels: Record<string, string> = {
  appartement: "Appartement",
  maison: "Maison",
  villa: "Villa",
  studio: "Studio",
  loft: "Loft",
  penthouse: "Penthouse",
  autre: "Autre",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function EstimationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [situationFilter, setSituationFilter] = useState("all")

  // Charger les estimations
  useEffect(() => {
    async function fetchEvaluations() {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (situationFilter !== "all") params.set("situation", situationFilter)

        const response = await fetch(`/api/evaluations?${params}`)

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des estimations")
        }

        const data = await response.json()
        setEvaluations(data)
      } catch (error) {
        console.error("Error fetching evaluations:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les demandes d'estimation.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluations()
  }, [statusFilter, situationFilter, toast])

  // Filtrer les estimations (recherche locale)
  const filteredEvaluations = evaluations.filter((evaluation) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = `${evaluation.firstName} ${evaluation.lastName}`.toLowerCase().includes(query)
      const matchesEmail = evaluation.email.toLowerCase().includes(query)
      const matchesPostalCode = evaluation.postalCode.includes(query)
      const matchesPhone = evaluation.phone?.includes(query)
      if (!matchesName && !matchesEmail && !matchesPostalCode && !matchesPhone) return false
    }
    return true
  })

  // Gérer le clic sur une ligne
  const handleRowClick = (evaluationId: string) => {
    router.push(`/estimations/${evaluationId}`)
  }

  // Supprimer une estimation
  const handleDelete = async (evaluationId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const evaluationToDelete = evaluations.find((ev) => ev.id === evaluationId)

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la demande de ${evaluationToDelete?.firstName} ${evaluationToDelete?.lastName} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setEvaluations((prev) => prev.filter((ev) => ev.id !== evaluationId))
      toast({
        title: "Demande supprimée",
        description: "La demande d'estimation a été supprimée.",
      })
    } catch (error) {
      console.error("Error deleting evaluation:", error)
      toast({
        title: "Échec de la suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer la demande.",
        variant: "destructive",
      })
    }
  }

  // Statistiques rapides
  const stats = {
    total: evaluations.length,
    nouvelles: evaluations.filter((e) => e.status === "NOUVELLE").length,
    enCours: evaluations.filter((e) => e.status === "EN_COURS").length,
    traitees: evaluations.filter((e) => e.status === "TRAITEE").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Demandes d&apos;estimation</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes d&apos;estimation reçues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.nouvelles}</p>
                <p className="text-sm text-muted-foreground">Nouvelles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Loader2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.enCours}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.traitees}</p>
                <p className="text-sm text-muted-foreground">Traitées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone, code postal..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="NOUVELLE">Nouvelle</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="TRAITEE">Traitée</SelectItem>
                <SelectItem value="ARCHIVEE">Archivée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={situationFilter} onValueChange={setSituationFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Situation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="ACHAT">Achat</SelectItem>
                <SelectItem value="VENTE">Vente</SelectItem>
                <SelectItem value="RENSEIGNEMENT">Renseignement</SelectItem>
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
              `${filteredEvaluations.length} demande${filteredEvaluations.length > 1 ? "s" : ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Aucune demande trouvée</h3>
              <p className="text-muted-foreground mt-1">
                {evaluations.length === 0
                  ? "Aucune demande d'estimation pour le moment"
                  : "Essayez de modifier vos critères de recherche"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Demandeur</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bien</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Localisation</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Situation</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow
                    key={evaluation.id}
                    className="group cursor-pointer"
                    onClick={() => handleRowClick(evaluation.id)}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(evaluation.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {evaluation.firstName} {evaluation.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {evaluation.email}
                        </span>
                        {evaluation.phone && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {evaluation.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          {propertyTypeLabels[evaluation.propertyType] || evaluation.propertyType}
                        </span>
                        {evaluation.surface && (
                          <span className="text-sm">{evaluation.surface} m²</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evaluation.postalCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={situationConfig[evaluation.situation]?.className}
                      >
                        {situationConfig[evaluation.situation]?.label || evaluation.situation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[evaluation.status]?.className}
                      >
                        {statusConfig[evaluation.status]?.label || evaluation.status}
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
                              router.push(`/estimations/${evaluation.id}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => handleDelete(evaluation.id, e)}
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

