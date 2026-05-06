"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, MoreHorizontal, Eye, Trash2, Loader2, Phone, Mail, Calendar, MessageSquare, Tag } from "lucide-react"
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

interface LeadData {
  id: string
  subject: string
  propertyReference: string | null
  profile: string | null
  financing: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  status: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NOUVEAU: { label: "Nouveau", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_COURS: { label: "En cours", className: "bg-amber-50 text-amber-700 border-amber-200" },
  TRAITE: { label: "Traité", className: "bg-green-50 text-green-700 border-green-200" },
  ARCHIVE: { label: "Archivé", className: "bg-muted text-muted-foreground border-border" },
}

const subjectConfig: Record<string, { label: string; className: string }> = {
  BIEN_SALE: { label: "Bien à vendre", className: "bg-violet-50 text-violet-700 border-violet-200" },
  BIEN_RENT: { label: "Bien à louer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ESTIMATION: { label: "Estimation", className: "bg-orange-50 text-orange-700 border-orange-200" },
  APPOINTMENT: { label: "Rendez-vous", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  OTHER: { label: "Autre", className: "bg-slate-50 text-slate-700 border-slate-200" },
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

export default function LeadsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [leads, setLeads] = useState<LeadData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")

  useEffect(() => {
    async function fetchLeads() {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (subjectFilter !== "all") params.set("subject", subjectFilter)

        const response = await fetch(`/api/leads?${params}`)

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des demandes")
        }

        const data = await response.json()
        setLeads(data)
      } catch (error) {
        console.error("Error fetching leads:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les demandes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [statusFilter, subjectFilter, toast])

  const filteredLeads = leads.filter((lead) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(query)
      const matchesEmail = lead.email.toLowerCase().includes(query)
      const matchesPhone = lead.phone?.includes(query)
      const matchesRef = lead.propertyReference?.toLowerCase().includes(query)
      if (!matchesName && !matchesEmail && !matchesPhone && !matchesRef) return false
    }
    return true
  })

  const handleRowClick = (leadId: string) => {
    router.push(`/leads/${leadId}`)
  }

  const handleDelete = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const leadToDelete = leads.find((l) => l.id === leadId)

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la demande de ${leadToDelete?.firstName} ${leadToDelete?.lastName} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setLeads((prev) => prev.filter((l) => l.id !== leadId))
      toast({
        title: "Demande supprimée",
        description: "La demande a été supprimée.",
      })
    } catch (error) {
      console.error("Error deleting lead:", error)
      toast({
        title: "Échec de la suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer la demande.",
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: leads.length,
    nouveaux: leads.filter((l) => l.status === "NOUVEAU").length,
    enCours: leads.filter((l) => l.status === "EN_COURS").length,
    traites: leads.filter((l) => l.status === "TRAITE").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Demandes de contact</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes de contact reçues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
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
                <p className="text-2xl font-bold text-foreground">{stats.nouveaux}</p>
                <p className="text-sm text-muted-foreground">Nouveaux</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.traites}</p>
                <p className="text-sm text-muted-foreground">Traités</p>
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
                placeholder="Rechercher par nom, email, téléphone, référence..."
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
                <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="TRAITE">Traité</SelectItem>
                <SelectItem value="ARCHIVE">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sujets</SelectItem>
                <SelectItem value="BIEN_SALE">Bien à vendre</SelectItem>
                <SelectItem value="BIEN_RENT">Bien à louer</SelectItem>
                <SelectItem value="ESTIMATION">Estimation</SelectItem>
                <SelectItem value="APPOINTMENT">Rendez-vous</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
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
              `${filteredLeads.length} demande${filteredLeads.length > 1 ? "s" : ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Aucune demande trouvée</h3>
              <p className="text-muted-foreground mt-1">
                {leads.length === 0
                  ? "Aucune demande pour le moment"
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
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sujet</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bien</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="group cursor-pointer"
                    onClick={() => handleRowClick(lead.id)}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={subjectConfig[lead.subject]?.className}
                      >
                        {subjectConfig[lead.subject]?.label || lead.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.propertyReference ? (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {lead.propertyReference}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[lead.status]?.className}
                      >
                        {statusConfig[lead.status]?.label || lead.status}
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
                              router.push(`/leads/${lead.id}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => handleDelete(lead.id, e)}
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
