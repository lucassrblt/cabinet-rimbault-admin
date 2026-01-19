"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckboxField } from "../components/CheckboxField"
import { ImageUploader } from "../components/ImageUploader"
import type { PropertyFormData, PropertyImageData } from "../types"

interface ImagesStepProps {
  form: UseFormReturn<PropertyFormData>
  existingImages: PropertyImageData[]
  newImages: File[]
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>
  onDeleteImage: (imageId: string) => Promise<void>
  onSetMainImage: (imageId: string) => Promise<void>
}

export function ImagesStep({
  form,
  existingImages,
  newImages,
  setNewImages,
  onDeleteImage,
  onSetMainImage,
}: ImagesStepProps) {
  return (
    <div className="space-y-6">
      {/* Images */}
      <ImageUploader
        existingImages={existingImages}
        newImages={newImages}
        setNewImages={setNewImages}
        onDeleteImage={onDeleteImage}
        onSetMainImage={onSetMainImage}
      />

      {/* Publication options */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Options de publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CheckboxField
                    label="Publier l'annonce immédiatement"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="ml-6">
                  L&apos;annonce sera visible sur le site public
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CheckboxField
                    label="Mettre en avant"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="ml-6">
                  L&apos;annonce apparaîtra en premier sur la page d&apos;accueil
                </FormDescription>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}

