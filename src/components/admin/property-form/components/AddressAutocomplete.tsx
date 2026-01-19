"use client"

import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAddressAutocomplete } from "../hooks/useAddressAutocomplete"
import type { PropertyFormData, AddressSuggestion } from "../types"

interface AddressAutocompleteProps {
  form: UseFormReturn<PropertyFormData>
  initialAddress?: string
}

export function AddressAutocomplete({ form, initialAddress }: AddressAutocompleteProps) {
  const handleAddressSelected = (suggestion: AddressSuggestion) => {
    const address = suggestion.street 
      ? `${suggestion.housenumber || ""} ${suggestion.street}`.trim()
      : suggestion.label.split(",")[0].trim()
    
    form.setValue("address", address, { shouldValidate: true, shouldDirty: true })
    form.setValue("postalCode", suggestion.postcode, { shouldValidate: true, shouldDirty: true })
    form.setValue("city", suggestion.city, { shouldValidate: true, shouldDirty: true })
  }

  const {
    addressQuery,
    setAddressQuery,
    addressSuggestions,
    isLoadingAddresses,
    showAddressSuggestions,
    setShowAddressSuggestions,
    addressInputRef,
    suggestionsRef,
    handleAddressSelect,
  } = useAddressAutocomplete({
    initialAddress,
    onAddressSelect: handleAddressSelected,
  })

  // Synchroniser addressQuery avec la valeur du formulaire
  const watchedAddress = form.watch("address")
  useEffect(() => {
    if (watchedAddress && watchedAddress !== addressQuery) {
      setAddressQuery(watchedAddress)
    }
  }, [watchedAddress, addressQuery, setAddressQuery])

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel>Adresse *</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={addressInputRef}
                  placeholder="12 rue de la République"
                  value={addressQuery}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setAddressQuery(newValue)
                    field.onChange(newValue)
                    setShowAddressSuggestions(true)
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowAddressSuggestions(true)
                    }
                  }}
                  className="pl-10"
                />
                {isLoadingAddresses && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>
            
            {/* Dropdown des suggestions d'adresses avec animation */}
            <div
              ref={suggestionsRef}
              className={`
                absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden
                transition-all duration-200 ease-out origin-top
                ${showAddressSuggestions && addressSuggestions.length > 0
                  ? "opacity-100 scale-y-100 translate-y-0"
                  : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                }
              `}
            >
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddressSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 border-b border-border last:border-b-0 transition-colors duration-150"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {suggestion.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.context}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code postal *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="69001" 
                  maxLength={5} 
                  {...field} 
                  className="bg-muted/30"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Rempli automatiquement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Lyon" 
                  {...field} 
                  className="bg-muted/30"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Rempli automatiquement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quartier</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Terreaux" 
                  {...field} 
                  value={field.value ?? ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

