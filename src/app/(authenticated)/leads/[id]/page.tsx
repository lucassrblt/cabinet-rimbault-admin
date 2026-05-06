"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User,
  FileText,
  MessageSquare,
  Tag,
  Calendar,
  Shield,
  Globe,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  CreditCard,
  CalendarCheck,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

interface LeadData {
  id: string
  subject: string
  propertyReference: string | null
  profile: string | null
  financing: string | null
  visitAvailability: string[]
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  rgpd: boolean | null
  source: string | null
  page: string | null
  userAgent: string | null
  referer: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  NOUVEAU: {
    label: "Nouveau",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  EN_COURS: {
    label: "En cours",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="h-4 w-4" />,
  },
  TRAITE: {
    label: "Traité",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  ARCHIVE: {
    label: "Archivé",
    className: "bg-muted text-muted-foreground border-border",
    icon: <Archive className="h-4 w-4" />,
  },
}

const subjectConfig: Record<string, { label: string; className: string }> = {
  BIEN_SALE: { label: "Bien à vendre", className: "bg-violet-50 text-violet-700 border-violet-200" },
  BIEN_RENT: { label: "Bien à louer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ESTIMATION: { label: "Estimation", className: "bg-orange-50 text-orange-700 border-orange-200" },
  APPOINTMENT: { label: "Rendez-vous", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  OTHER: { label: "Autre", className: "bg-slate-50 text-slate-700 border-slate-200" },
}

const profileLabels: Record<string, string> = {
  BUYER: "Acheteur",
  INVESTOR: "Investisseur",
  CURIOUS: "Curieux",
  TENANT: "Locataire",
}

const financingLabels: Record<string, string> = {
  APPROVED: "Financement approuvé",
  IN_PROGRESS: "En cours d'obtention",
  TO_STUDY: "À étudier",
  CASH: "Comptant",
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

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { toast } = useToast()
  const [lead, setLead] = useState<LeadData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/leads/${id}`)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors du chargement")
        }

        const data = await response.json()
        setLead(data)
        setNotes(data.notes || "")
        setStatus(data.status)
      } catch (err) {
        console.error("Error fetching lead:", err)
        const message = err instanceof Error ? err.message : "Erreur lors du chargement"
        setError(message)
        toast({
          title: "Demande introuvable",
          description: "Cette demande n'existe pas ou a été supprimée.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLead()
  }, [id, toast])

  const handleSave = async () => {
    if (!lead) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, status }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      const updatedLead = await response.json()
      setLead(updatedLead)

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

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Demande introuvable</h2>
            <p className="text-muted-foreground mt-1">
              {error || "Cette demande n'existe pas ou a été supprimée."}
            </p>
          </div>
          <Link href="/leads">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/leads"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux demandes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {lead.firstName} {lead.lastName}
              </h1>
              <Badge variant="outline" className={statusConfig[lead.status]?.className}>
                {statusConfig[lead.status]?.icon}
                <span className="ml-1">{statusConfig[lead.status]?.label}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reçu le {formatDate(lead.createdAt)}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${subjectConfig[lead.subject]?.className} text-sm px-3 py-1`}
          >
            {subjectConfig[lead.subject]?.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de contact */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Informations de contact
              </CardTitle>
              <CardDescription>Message et coordonnées du demandeur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-lg font-semibold text-foreground">
                    {lead.firstName} {lead.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.phone && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-foreground whitespace-pre-wrap">{lead.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profil acquéreur */}
          {(lead.profile || lead.financing || (lead.visitAvailability && lead.visitAvailability.length > 0)) && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Profil acquéreur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lead.profile && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Profil
                      </p>
                      <p className="font-medium text-foreground">
                        {profileLabels[lead.profile] || lead.profile}
                      </p>
                    </div>
                  )}
                  {lead.financing && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Financement
                      </p>
                      <p className="font-medium text-foreground">
                        {financingLabels[lead.financing] || lead.financing}
                      </p>
                    </div>
                  )}
                </div>

                {lead.visitAvailability && lead.visitAvailability.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3" />
                      Disponibilités de visite
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lead.visitAvailability.map((slot) => (
                        <Badge key={slot} variant="secondary">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bien concerné */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Bien concerné
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Sujet</p>
                  <Badge variant="outline" className={subjectConfig[lead.subject]?.className}>
                    {subjectConfig[lead.subject]?.label || lead.subject}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Référence du bien</p>
                  {lead.propertyReference ? (
                    <Link
                      href={`/properties?search=${lead.propertyReference}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {lead.propertyReference}
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">Non renseignée</p>
                  )}
                </div>
              </div>
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
                placeholder="Ajouter des notes sur cette demande..."
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
                    <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="TRAITE">Traité</SelectItem>
                    <SelectItem value="ARCHIVE">Archivé</SelectItem>
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

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Coordonnées */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground truncate">{lead.email}</p>
                  </div>
                </a>

                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-medium text-foreground">{lead.phone}</p>
                    </div>
                  </a>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </a>
                </Button>
                {lead.phone && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${lead.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Appeler
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consentement */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Consentement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">RGPD</span>
                <Badge variant={lead.rgpd ? "default" : "destructive"} className="text-xs">
                  {lead.rgpd ? "Accepté" : "Non accepté"}
                </Badge>
              </div>
              {lead.source && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="text-foreground">{lead.source}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-foreground">{lead.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="text-foreground">
                  {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span className="text-foreground">
                  {new Date(lead.updatedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {lead.page && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page d&apos;origine</span>
                  <span className="text-foreground text-xs truncate max-w-[150px]">{lead.page}</span>
                </div>
              )}
              {lead.referer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referer</span>
                  <span className="text-foreground text-xs truncate max-w-[150px]">{lead.referer}</span>
                </div>
              )}
              {lead.userAgent && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">User Agent</span>
                  <p className="text-foreground text-xs break-all">{lead.userAgent}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
