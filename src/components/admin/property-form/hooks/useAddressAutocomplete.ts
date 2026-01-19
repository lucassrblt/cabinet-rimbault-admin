import { useState, useEffect, useRef, useCallback } from "react"
import { useDebounce } from "./useDebounce"
import type { AddressSuggestion, AddressApiResponse } from "../types"

interface UseAddressAutocompleteProps {
  initialAddress?: string
  onAddressSelect?: (suggestion: AddressSuggestion) => void
}

export function useAddressAutocomplete({ initialAddress = "", onAddressSelect }: UseAddressAutocompleteProps = {}) {
  const [addressQuery, setAddressQuery] = useState(initialAddress)
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const debouncedAddressQuery = useDebounce(addressQuery, 300)

  // Recherche d'adresses avec l'API gouvernementale
  useEffect(() => {
    const fetchAddresses = async () => {
      if (debouncedAddressQuery.length < 3) {
        setAddressSuggestions([])
        return
      }

      setIsLoadingAddresses(true)
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(debouncedAddressQuery)}&limit=5`
        )
        const data: AddressApiResponse = await response.json()
        
        const suggestions: AddressSuggestion[] = data.features.map((feature) => ({
          label: feature.properties.label,
          housenumber: feature.properties.housenumber,
          street: feature.properties.street,
          postcode: feature.properties.postcode,
          city: feature.properties.city,
          context: feature.properties.context,
          x: feature.properties.x,
          y: feature.properties.y,
        }))
        
        setAddressSuggestions(suggestions)
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresses:", error)
        setAddressSuggestions([])
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    fetchAddresses()
  }, [debouncedAddressQuery])

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Sélection d'une adresse suggérée
  const handleAddressSelect = useCallback((suggestion: AddressSuggestion) => {
    const address = suggestion.street 
      ? `${suggestion.housenumber || ""} ${suggestion.street}`.trim()
      : suggestion.label.split(",")[0].trim()
    
    setAddressQuery(address)
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
    
    onAddressSelect?.(suggestion)
  }, [onAddressSelect])

  return {
    addressQuery,
    setAddressQuery,
    addressSuggestions,
    isLoadingAddresses,
    showAddressSuggestions,
    setShowAddressSuggestions,
    addressInputRef,
    suggestionsRef,
    handleAddressSelect,
  }
}

