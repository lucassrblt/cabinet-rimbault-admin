"use client"

import { useState, useEffect } from "react"
import { 
  Building2,
  Save, 
  Loader2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AgencySettings {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<AgencySettings>({
    id: "default",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/agency-settings")
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les paramètres. Vérifiez votre connexion.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/agency-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde")

      const data = await response.json()
      setSettings(data)

      toast({
        title: "Paramètres sauvegardés",
        description: "Les informations de l'agence ont été mises à jour avec succès.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres. Réessayez plus tard.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof AgencySettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Paramètres de l&apos;agence</h1>
        <p className="text-muted-foreground mt-1">
          Configurez les informations de votre agence qui apparaîtront sur les fiches descriptives
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informations de l&apos;agence
            </CardTitle>
            <CardDescription>
              Ces informations seront utilisées lors de la génération des fiches descriptives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nom de l'agence */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom de l&apos;agence
              </Label>
              <Input
                id="name"
                placeholder="Ex: Cabinet Rimbault Immobilier"
                value={settings.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Adresse
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="address" className="text-sm">
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    placeholder="Ex: 123 Avenue des Champs-Élysées"
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm">
                    Code postal
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="Ex: 75008"
                    value={settings.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                  <Label htmlFor="city" className="text-sm">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Paris"
                    value={settings.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                Contact
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Téléphone professionnel
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 01 23 45 67 89"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email professionnel
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: contact@cabinet-rimbault.fr"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

