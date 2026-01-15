"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PropertyForm, PropertyApiData } from "@/components/admin/PropertyForm"
import { useToast } from "@/hooks/use-toast"

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<PropertyApiData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties/${id}`)
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors du chargement de l'annonce")
        }

        const data = await response.json()
        setProperty(data)
      } catch (err) {
        console.error("Error fetching property:", err)
        const message = err instanceof Error ? err.message : "Erreur lors du chargement de l'annonce"
        setError(message)
        toast({
          title: "Annonce introuvable",
          description: "Cette annonce n'existe pas ou a été supprimée. Vous allez être redirigé vers la liste.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de l&apos;annonce...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg 
              className="h-8 w-8 text-destructive" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Annonce introuvable</h2>
            <p className="text-muted-foreground mt-1">
              {error || "Cette annonce n'existe pas ou a été supprimée."}
            </p>
          </div>
          <button
            onClick={() => router.push("/properties")}
            className="mt-4 text-primary hover:underline"
          >
            Retour à la liste des annonces
          </button>
        </div>
      </div>
    )
  }

  return (
    <PropertyForm 
      mode="edit" 
      initialData={property} 
      propertyId={id} 
    />
  )
}

