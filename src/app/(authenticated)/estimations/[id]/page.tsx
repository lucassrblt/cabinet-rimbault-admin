"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Home,
  Calendar,
  Ruler,
  BedDouble,
  Bath,
  Layers,
  Car,
  Trees,
  Building,
  Waves,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface EvaluationData {
  id: string
  propertyType: string
  postalCode: string
  address: string | null
  surface: string | null
  levels: string | null
  rooms: string | null
  bedrooms: string | null
  bathrooms: string | null
  constructionYear: string | null
  renovations: string | null
  hasGarage: boolean
  hasPool: boolean
  hasGarden: boolean
  hasBalcony: boolean
  hasTerrace: boolean
  situation: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  NOUVELLE: { label: "Nouvelle", className: "bg-blue-50 text-blue-700 border-blue-200", icon: <AlertCircle className="h-4 w-4" /> },
  EN_COURS: { label: "En cours", className: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="h-4 w-4" /> },
  TRAITEE: { label: "Traitée", className: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="h-4 w-4" /> },
  ARCHIVEE: { label: "Archivée", className: "bg-muted text-muted-foreground border-border", icon: <Archive className="h-4 w-4" /> },
}

const situationConfig: Record<string, { label: string; className: string }> = {
  ACHAT: { label: "Projet d'achat", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VENTE: { label: "Projet de vente", className: "bg-violet-50 text-violet-700 border-violet-200" },
  RENSEIGNEMENT: { label: "Simple renseignement", className: "bg-slate-50 text-slate-700 border-slate-200" },
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function EstimationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchEvaluation() {
      try {
        const response = await fetch(`/api/evaluations/${id}`)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors du chargement")
        }

        const data = await response.json()
        setEvaluation(data)
        setNotes(data.notes || "")
        setStatus(data.status)
      } catch (err) {
        console.error("Error fetching evaluation:", err)
        const message = err instanceof Error ? err.message : "Erreur lors du chargement"
        setError(message)
        toast({
          title: "Demande introuvable",
          description: "Cette demande d'estimation n'existe pas ou a été supprimée.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluation()
  }, [id, toast])

  const handleSave = async () => {
    if (!evaluation) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, status }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      const updatedEvaluation = await response.json()
      setEvaluation(updatedEvaluation)

      toast({
        title: "Modifications enregistrées",
        description: "Les informations ont été mises à jour.",
      })
    } catch (error) {
      console.error("Error saving:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de la demande...</p>
        </div>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Demande introuvable</h2>
            <p className="text-muted-foreground mt-1">
              {error || "Cette demande d'estimation n'existe pas ou a été supprimée."}
            </p>
          </div>
          <Link href="/estimations">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const amenities = [
    { label: "Garage", value: evaluation.hasGarage, icon: <Car className="h-4 w-4" /> },
    { label: "Piscine", value: evaluation.hasPool, icon: <Waves className="h-4 w-4" /> },
    { label: "Jardin", value: evaluation.hasGarden, icon: <Trees className="h-4 w-4" /> },
    { label: "Balcon", value: evaluation.hasBalcony, icon: <Building className="h-4 w-4" /> },
    { label: "Terrasse", value: evaluation.hasTerrace, icon: <Layers className="h-4 w-4" /> },
  ]

  const hasAmenities = amenities.some((a) => a.value)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/estimations" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux demandes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Demande de {evaluation.firstName} {evaluation.lastName}
              </h1>
              <Badge variant="outline" className={statusConfig[evaluation.status]?.className}>
                {statusConfig[evaluation.status]?.icon}
                <span className="ml-1">{statusConfig[evaluation.status]?.label}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reçue le {formatDate(evaluation.createdAt)}
            </p>
          </div>
          <Badge variant="outline" className={`${situationConfig[evaluation.situation]?.className} text-sm px-3 py-1`}>
            {situationConfig[evaluation.situation]?.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du bien */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Informations du bien
              </CardTitle>
              <CardDescription>Détails du bien à estimer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type et localisation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type de bien</p>
                  <p className="text-lg font-semibold text-foreground">
                    {propertyTypeLabels[evaluation.propertyType] || evaluation.propertyType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Code postal</p>
                  <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {evaluation.postalCode}
                  </p>
                </div>
              </div>

              {evaluation.address && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Adresse complète</p>
                  <p className="text-foreground">{evaluation.address}</p>
                </div>
              )}

              <Separator />

              {/* Caractéristiques */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {evaluation.surface && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Ruler className="h-5 w-5 text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">{evaluation.surface}</p>
                    <p className="text-xs text-muted-foreground">m²</p>
                  </div>
                )}
                {evaluation.rooms && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Home className="h-5 w-5 text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">{evaluation.rooms}</p>
                    <p className="text-xs text-muted-foreground">pièces</p>
                  </div>
                )}
                {evaluation.bedrooms && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <BedDouble className="h-5 w-5 text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">{evaluation.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">chambres</p>
                  </div>
                )}
                {evaluation.bathrooms && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Bath className="h-5 w-5 text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">{evaluation.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">SdB</p>
                  </div>
                )}
                {evaluation.levels && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                    <Layers className="h-5 w-5 text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">{evaluation.levels}</p>
                    <p className="text-xs text-muted-foreground">niveaux</p>
                  </div>
                )}
              </div>

              {evaluation.constructionYear && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Année de construction</p>
                    <p className="text-foreground font-medium">{evaluation.constructionYear}</p>
                  </div>
                </>
              )}

              {evaluation.renovations && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Travaux / Rénovations</p>
                    <p className="text-foreground whitespace-pre-wrap">{evaluation.renovations}</p>
                  </div>
                </>
              )}

              {hasAmenities && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {amenities
                        .filter((a) => a.value)
                        .map((amenity) => (
                          <Badge key={amenity.label} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                            {amenity.icon}
                            {amenity.label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes internes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Notes internes
              </CardTitle>
              <CardDescription>Ajoutez vos notes sur cette demande</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ajouter des notes sur cette demande d'estimation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOUVELLE">Nouvelle</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="TRAITEE">Traitée</SelectItem>
                    <SelectItem value="ARCHIVEE">Archivée</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Coordonnées */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Coordonnées du demandeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                <p className="text-lg font-semibold text-foreground">
                  {evaluation.firstName} {evaluation.lastName}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <a
                  href={`mailto:${evaluation.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground truncate">{evaluation.email}</p>
                  </div>
                </a>

                {evaluation.phone && (
                  <a
                    href={`tel:${evaluation.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-medium text-foreground">{evaluation.phone}</p>
                    </div>
                  </a>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${evaluation.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </a>
                </Button>
                {evaluation.phone && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${evaluation.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Appeler
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-foreground">{evaluation.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le</span>
                <span className="text-foreground">{new Date(evaluation.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifiée le</span>
                <span className="text-foreground">{new Date(evaluation.updatedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

