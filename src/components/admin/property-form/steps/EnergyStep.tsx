"use client"

import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnergyLabelsPreview } from "../components/EnergyLabelsPreview"
import { EnergyConsistencyWarning } from "../components/EnergyConsistencyWarning"
import { ENERGY_CLASSES, HEATING_TYPE_OPTIONS, HEATING_ENERGY_OPTIONS } from "../constants"
import type { PropertyFormData, PropertyApiData } from "../types"

interface EnergyStepProps {
  form: UseFormReturn<PropertyFormData>
  mode: "create" | "edit"
  initialData?: PropertyApiData
  previewDpeUrl: string | null
  previewGesUrl: string | null
  setPreviewDpeUrl: (url: string | null) => void
  setPreviewGesUrl: (url: string | null) => void
  isGeneratingLabels: boolean
  setIsGeneratingLabels: (loading: boolean) => void
}

export function EnergyStep({
  form,
  mode,
  initialData,
  previewDpeUrl,
  previewGesUrl,
  setPreviewDpeUrl,
  setPreviewGesUrl,
  isGeneratingLabels,
  setIsGeneratingLabels,
}: EnergyStepProps) {
  return (
    <div className="space-y-6">
      {/* DPE */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Diagnostic de Performance Énergétique</CardTitle>
          <CardDescription>
            Informations obligatoires pour la vente ou la location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="energyClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe énergie (DPE) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENERGY_CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    La classe &quot;Vierge&quot; n&apos;est pas autorisée
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="energyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consommation (énergie primaire) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="150" 
                        {...field} 
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="pr-24" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        kWh/m²/an
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="finalEnergyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Énergie finale</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="87"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="pr-24"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        kWh/m²/an
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Facultatif — la ligne n&apos;apparaît sur l&apos;étiquette que si elle est renseignée
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="gesClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe GES *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENERGY_CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    La classe &quot;Vierge&quot; n&apos;est pas autorisée
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gesValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Émissions GES *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="25" 
                        {...field} 
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="pr-28" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        kg CO₂/m²/an
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <EnergyConsistencyWarning
            energyClass={form.watch("energyClass")}
            energyValue={form.watch("energyValue")}
            gesClass={form.watch("gesClass")}
            gesValue={form.watch("gesValue")}
          />
        </CardContent>
      </Card>

      {/* Chauffage */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Chauffage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="heatingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de chauffage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HEATING_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heatingEnergy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Énergie de chauffage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HEATING_ENERGY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prévisualisation des étiquettes */}
      <EnergyLabelsPreview
        form={form}
        mode={mode}
        initialData={initialData}
        previewDpeUrl={previewDpeUrl}
        previewGesUrl={previewGesUrl}
        setPreviewDpeUrl={setPreviewDpeUrl}
        setPreviewGesUrl={setPreviewGesUrl}
        isGeneratingLabels={isGeneratingLabels}
        setIsGeneratingLabels={setIsGeneratingLabels}
      />
    </div>
  )
}

