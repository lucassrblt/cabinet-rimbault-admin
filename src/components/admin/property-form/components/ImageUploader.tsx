"use client"

import { useCallback } from "react"
import { ImagePlus, X, Star, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyImageData } from "../types"

interface ImageUploaderProps {
  existingImages: PropertyImageData[]
  newImages: File[]
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>
  onDeleteImage: (imageId: string) => Promise<void>
  onSetMainImage: (imageId: string) => Promise<void>
  maxImages?: number
}

export function ImageUploader({
  existingImages,
  newImages,
  setNewImages,
  onDeleteImage,
  onSetMainImage,
  maxImages = 20,
}: ImageUploaderProps) {
  const { toast } = useToast()
  const totalImages = existingImages.length + newImages.length

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    const newTotal = existingImages.length + newImages.length + files.length
    
    if (newTotal > maxImages) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez pas ajouter plus de ${maxImages} images au total.`,
        variant: "destructive",
      })
      const allowedCount = maxImages - existingImages.length - newImages.length
      if (allowedCount > 0) {
        setNewImages(prev => [...prev, ...files.slice(0, allowedCount)])
      }
      return
    }
    setNewImages(prev => [...prev, ...files])
  }, [existingImages.length, newImages.length, maxImages, setNewImages, toast])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"))
      const newTotal = existingImages.length + newImages.length + files.length
      
      if (newTotal > maxImages) {
        toast({
          title: "Limite atteinte",
          description: `Vous ne pouvez pas ajouter plus de ${maxImages} images au total.`,
          variant: "destructive",
        })
        const allowedCount = maxImages - existingImages.length - newImages.length
        if (allowedCount > 0) {
          setNewImages(prev => [...prev, ...files.slice(0, allowedCount)])
        }
        return
      }
      setNewImages(prev => [...prev, ...files])
    }
  }, [existingImages.length, newImages.length, maxImages, setNewImages, toast])

  const removeNewImage = useCallback((index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }, [setNewImages])

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Photos du bien</CardTitle>
        <CardDescription>
          Ajoutez jusqu&apos;à {maxImages} photos. Cliquez sur l&apos;étoile pour définir l&apos;image principale.
          <span className="block mt-1 text-xs">
            {totalImages}/{maxImages} images
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de drop */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById("image-input")?.click()}
        >
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">
            Glissez-déposez vos images ici
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou cliquez pour sélectionner des fichiers
          </p>
        </div>

        {/* Images existantes */}
        {existingImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Images enregistrées</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt || "Image du bien"}
                    className="w-full h-full object-cover"
                  />
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Principale
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isMain && (
                      <button
                        type="button"
                        onClick={() => onSetMainImage(image.id)}
                        className="bg-white text-foreground p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Définir comme principale"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteImage(image.id)}
                      className="bg-white text-destructive p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouvelles images (pas encore uploadées) */}
        {newImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Nouvelles images à uploader
              <span className="text-muted-foreground font-normal ml-2">
                ({newImages.length} image{newImages.length > 1 ? "s" : ""})
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newImages.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-primary/50 bg-primary/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Nouvelle image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                    Nouveau
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-foreground/80 text-background p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

