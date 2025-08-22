"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FactsSchema, type Facts } from "@/lib/schemas"
import { Home, MapPin, Building, DollarSign, FileText } from "lucide-react"

const NZ_CITIES = [
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", 
  "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua",
  "New Plymouth", "Whangarei", "Invercargill", "Whanganui", "Gisborne"
]

const PROPERTY_FEATURES = [
  "Heat pump", "Double glazing", "Alarm system", "Dishwasher", 
  "Garage", "Carport", "Deck", "Patio", "Swimming pool", "Spa pool",
  "Fireplace", "Study", "Ensuite", "Walk-in wardrobe", "Garden shed",
  "Fenced section", "Sea views", "Mountain views", "North-facing",
  "Recently renovated", "New kitchen", "New bathroom"
]

interface ListingFormProps {
  onSubmit: (data: Facts) => void
  isLoading?: boolean
}

export function ListingForm({ onSubmit, isLoading }: ListingFormProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Facts>({
    resolver: zodResolver(FactsSchema),
    defaultValues: {
      propertyType: "house",
      bedrooms: 3,
      bathrooms: 1,
    }
  })

  const propertyType = watch("propertyType")

  const toggleFeature = (feature: string) => {
    const updated = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature]
    
    setSelectedFeatures(updated)
    setValue("features", updated)
  }

  const onFormSubmit = (data: Facts) => {
    onSubmit({ ...data, features: selectedFeatures })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Property Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                placeholder="123 Queen Street"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb *</Label>
              <Input
                id="suburb"
                placeholder="Ponsonby"
                {...register("suburb")}
              />
              {errors.suburb && (
                <p className="text-sm text-red-600">{errors.suburb.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select onValueChange={(value) => setValue("city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {NZ_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="1011"
                {...register("postcode")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select onValueChange={(value) => setValue("propertyType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                  <SelectItem value="section">Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                max="15"
                {...register("bedrooms", { valueAsNumber: true })}
              />
              {errors.bedrooms && (
                <p className="text-sm text-red-600">{errors.bedrooms.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                max="10"
                {...register("bathrooms", { valueAsNumber: true })}
              />
              {errors.bathrooms && (
                <p className="text-sm text-red-600">{errors.bathrooms.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking">Car Spaces</Label>
              <Input
                id="parking"
                type="number"
                min="0"
                max="10"
                {...register("parking", { valueAsNumber: true })}
              />
            </div>
          </div>

          {propertyType !== "section" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floorAreaM2">Floor Area (m²)</Label>
                <Input
                  id="floorAreaM2"
                  type="number"
                  min="1"
                  placeholder="120"
                  {...register("floorAreaM2", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landAreaM2">Land Area (m²)</Label>
                <Input
                  id="landAreaM2"
                  type="number"
                  min="1"
                  placeholder="650"
                  {...register("landAreaM2", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  min="1850"
                  max={new Date().getFullYear()}
                  placeholder="1990"
                  {...register("yearBuilt", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valuation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cv">Capital Value (CV)</Label>
              <Input
                id="cv"
                type="number"
                min="1"
                placeholder="750000"
                {...register("cv", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rv">Rateable Value (RV)</Label>
              <Input
                id="rv"
                type="number"
                min="1"
                placeholder="680000"
                {...register("rv", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PROPERTY_FEATURES.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`p-2 text-sm rounded-md border text-left transition-colors ${
                  selectedFeatures.includes(feature)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-input"
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special features, recent renovations, or important details..."
              className="min-h-[100px]"
              {...register("notes")}
            />
            <p className="text-sm text-muted-foreground">
              These notes help generate better copy but won&apos;t appear in the final listing.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Listing..." : "Create Listing"}
      </Button>
    </form>
  )
}