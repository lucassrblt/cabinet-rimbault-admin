"use client"

import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddressAutocomplete } from "../components/AddressAutocomplete"
import { 
  PROPERTY_TYPE_OPTIONS, 
  TRANSACTION_TYPE_OPTIONS, 
  STATUS_OPTIONS 
} from "../constants"
import { roundToNiceNumber } from "../utils"
import type { PropertyFormData } from "../types"

interface GeneralInfoStepProps {
  form: UseFormReturn<PropertyFormData>
  initialAddress?: string
}

export function GeneralInfoStep({ form, initialAddress }: GeneralInfoStepProps) {
  const price = form.watch("price")
  const honorairesPct = form.watch("honorairesPct")
  const honorairesType = form.watch("honorairesType")

  // Calculer les honoraires automatiquement quand le prix ou le pourcentage change
  useEffect(() => {
    if (honorairesType === "acquereur" && price && honorairesPct) {
      const calculatedHonoraires = (Number(price) * Number(honorairesPct)) / (100 + Number(honorairesPct))
      const roundedHonoraires = roundToNiceNumber(calculatedHonoraires)
      form.setValue("honoraires", roundedHonoraires)
    }
  }, [price, honorairesPct, honorairesType, form])

  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Informations de base</CardTitle>
          <CardDescription>
            Les informations principales de l&apos;annonce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence *</FormLabel>
                  <FormControl>
                    <Input placeholder="AP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
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

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de l&apos;annonce *</FormLabel>
                <FormControl>
                  <Input placeholder="Appartement T3 avec balcon en centre-ville" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez le bien en détail..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de bien *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
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
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de transaction *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
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

      {/* Prix et frais */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Prix et frais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="250000" 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="pr-8" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="charges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charges mensuelles</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="150" 
                        {...field} 
                        value={field.value ?? ""} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="pr-8" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="honorairesType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Honoraires à charge de</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vendeur">Vendeur</SelectItem>
                      <SelectItem value="acquereur">Acquéreur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("honorairesType") === "acquereur" ? (
              <FormField
                control={form.control}
                name="honorairesPct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pourcentage honoraires</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="100" 
                          placeholder="4.76" 
                          {...field} 
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          className="pr-8" 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="honoraires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Honoraires</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field} 
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          className="pr-8" 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          {/* Affichage du calcul prix hors honoraires */}
          {form.watch("honorairesType") === "acquereur" && form.watch("price") && form.watch("honorairesPct") && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prix FAI (Frais d&apos;agence inclus)</span>
                  <span className="font-medium">{Number(form.watch("price")).toLocaleString("fr-FR")} €</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">Honoraires ({form.watch("honorairesPct")}%)</span>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="honoraires"
                      render={({ field }) => (
                        <div className="relative">
                          <Input
                            type="number"
                            className="w-32 pr-8 text-right font-medium text-destructive"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                        </div>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const calculatedHonoraires = (Number(form.watch("price")) * Number(form.watch("honorairesPct"))) / (100 + Number(form.watch("honorairesPct")))
                        const roundedHonoraires = roundToNiceNumber(calculatedHonoraires)
                        form.setValue("honoraires", roundedHonoraires)
                      }}
                      title="Recalculer et arrondir"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Prix hors honoraires</span>
                  <span className="font-bold text-primary">
                    {(Number(form.watch("price")) - (form.watch("honoraires") ?? 0)).toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Localisation</CardTitle>
          <CardDescription>
            Commencez à taper l&apos;adresse pour voir des suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressAutocomplete form={form} initialAddress={initialAddress} />
        </CardContent>
      </Card>
    </div>
  )
}

