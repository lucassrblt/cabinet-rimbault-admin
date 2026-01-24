"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Save, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAddressAutocomplete } from "@/components/admin/property-form/hooks/useAddressAutocomplete";
import type { AddressSuggestion } from "@/components/admin/property-form/types";

interface AgencySettings {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AgencySettings>({
    id: "default",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  // Callback pour la sélection d'adresse
  const handleAddressSelectCallback = useCallback(
    (suggestion: AddressSuggestion) => {
      const address = suggestion.street
        ? `${suggestion.housenumber || ""} ${suggestion.street}`.trim()
        : suggestion.label.split(",")[0].trim();

      setSettings((prev) => ({
        ...prev,
        address: address,
        city: suggestion.city,
        postalCode: suggestion.postcode,
      }));
    },
    [],
  );

  // Hook d'autocomplétion d'adresse
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
    initialAddress: settings.address,
    onAddressSelect: handleAddressSelectCallback,
  });

  // Synchroniser addressQuery avec settings.address quand les settings sont chargés
  useEffect(() => {
    if (settings.address && addressQuery !== settings.address) {
      setAddressQuery(settings.address);
    }
  }, [settings.address, addressQuery, setAddressQuery]);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agency-settings");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Erreur de chargement",
        description:
          "Impossible de charger les paramètres. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/agency-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      const data = await response.json();
      setSettings(data);

      toast({
        title: "Paramètres sauvegardés",
        description:
          "Les informations de l'agence ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur de sauvegarde",
        description:
          "Impossible de sauvegarder les paramètres. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof AgencySettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Paramètres de l&apos;agence
        </h1>
        <p className="text-muted-foreground mt-1">
          Configurez les informations de votre agence qui apparaîtront sur les
          fiches descriptives
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
              Ces informations seront utilisées lors de la génération des fiches
              descriptives
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
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      ref={addressInputRef}
                      id="address"
                      placeholder="Commencez à taper pour rechercher une adresse..."
                      value={addressQuery}
                      onChange={(e) => {
                        setAddressQuery(e.target.value);
                        setShowAddressSuggestions(true);
                        handleChange("address", e.target.value);
                      }}
                      onFocus={() => {
                        if (addressSuggestions.length > 0) {
                          setShowAddressSuggestions(true);
                        }
                      }}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {isLoadingAddresses && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {/* Dropdown des suggestions d'adresses avec animation */}
                    <div
                      ref={suggestionsRef}
                      className={`
                        absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden
                        transition-all duration-200 ease-out origin-top
                        ${
                          showAddressSuggestions &&
                          addressSuggestions.length > 0
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
                  </div>
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
              <Button
                type="submit"
                disabled={isSaving}
                className="min-w-[140px]"
              >
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
  );
}
