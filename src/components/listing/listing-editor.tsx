"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EditableText } from "./editable-text"
import { Save, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react"

interface ListingVariants {
  long: string
  standard: string
  bullets: string[]
  headlines: string[]
  social?: {
    instagram: string
    facebook: string
    linkedin: string
  }
}

interface ListingEditorProps {
  listing: any
  variants: ListingVariants
  onSave: (variants: ListingVariants) => Promise<void>
  onRegenerate: () => Promise<void>
}

export function ListingEditor({ listing, variants, onSave, onRegenerate }: ListingEditorProps) {
  const [editedVariants, setEditedVariants] = useState<ListingVariants>(variants)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateVariant = useCallback((key: keyof ListingVariants, value: any) => {
    setEditedVariants(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }, [])

  const updateBullet = useCallback((index: number, value: string) => {
    setEditedVariants(prev => ({
      ...prev,
      bullets: prev.bullets.map((bullet, i) => i === index ? value : bullet)
    }))
    setHasUnsavedChanges(true)
  }, [])

  const updateHeadline = useCallback((index: number, value: string) => {
    setEditedVariants(prev => ({
      ...prev,
      headlines: prev.headlines.map((headline, i) => i === index ? value : headline)
    }))
    setHasUnsavedChanges(true)
  }, [])

  const updateSocial = useCallback((platform: 'instagram' | 'facebook' | 'linkedin', value: string) => {
    setEditedVariants(prev => ({
      ...prev,
      social: {
        ...prev.social!,
        [platform]: value
      }
    }))
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedVariants)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEditedVariants(variants)
    setHasUnsavedChanges(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Property Facts - Left Side */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Property Facts
            <Badge variant="outline">Locked</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Address</span>
              <p>{listing.address}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Suburb</span>
              <p>{listing.suburb}, {listing.city}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Type</span>
              <p className="capitalize">{listing.propertyType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Bedrooms</span>
              <p>{listing.bedrooms}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Bathrooms</span>
              <p>{listing.bathrooms}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Parking</span>
              <p>{listing.parking || "N/A"}</p>
            </div>
          </div>

          {(listing.floorAreaM2 || listing.landAreaM2) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.floorAreaM2 && (
                  <div>
                    <span className="font-medium text-gray-500">Floor Area</span>
                    <p>{listing.floorAreaM2}m²</p>
                  </div>
                )}
                {listing.landAreaM2 && (
                  <div>
                    <span className="font-medium text-gray-500">Land Area</span>
                    <p>{listing.landAreaM2}m²</p>
                  </div>
                )}
              </div>
            </>
          )}

          {(listing.cv || listing.rv) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.cv && (
                  <div>
                    <span className="font-medium text-gray-500">CV</span>
                    <p>${listing.cv.toLocaleString()}</p>
                  </div>
                )}
                {listing.rv && (
                  <div>
                    <span className="font-medium text-gray-500">RV</span>
                    <p>${listing.rv.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {listing.featuresJson && listing.featuresJson.length > 0 && (
            <>
              <Separator />
              <div>
                <span className="font-medium text-gray-500 text-sm">Features</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {listing.featuresJson.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {listing.notes && (
            <>
              <Separator />
              <div>
                <span className="font-medium text-gray-500 text-sm">Notes</span>
                <p className="text-sm mt-1 text-gray-600">{listing.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Editable Copy - Right Side */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Generated Copy
              {hasUnsavedChanges && <Badge variant="destructive">Unsaved</Badge>}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasUnsavedChanges}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headlines */}
          <div>
            <h4 className="font-medium mb-3">Headlines</h4>
            <div className="space-y-2">
              {editedVariants.headlines.map((headline, index) => (
                <EditableText
                  key={index}
                  value={headline}
                  onChange={(value) => updateHeadline(index, value)}
                  placeholder="Enter headline"
                  maxLength={80}
                  showCharCount
                  className="bg-blue-50"
                />
              ))}
            </div>
          </div>

          {/* Standard Copy */}
          <div>
            <h4 className="font-medium mb-3">Standard Description</h4>
            <EditableText
              value={editedVariants.standard}
              onChange={(value) => updateVariant('standard', value)}
              multiline
              placeholder="Enter standard description"
              maxLength={220}
              showCharCount
              className="bg-green-50"
            />
          </div>

          {/* Long Copy */}
          <div>
            <h4 className="font-medium mb-3">Long Description</h4>
            <EditableText
              value={editedVariants.long}
              onChange={(value) => updateVariant('long', value)}
              multiline
              placeholder="Enter long description"
              maxLength={400}
              showCharCount
              className="bg-purple-50"
            />
          </div>

          {/* Bullet Points */}
          <div>
            <h4 className="font-medium mb-3">Key Features</h4>
            <div className="space-y-2">
              {editedVariants.bullets.map((bullet, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <div className="flex-1">
                    <EditableText
                      value={bullet}
                      onChange={(value) => updateBullet(index, value)}
                      placeholder="Enter feature"
                      maxLength={50}
                      className="bg-yellow-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Content */}
          {editedVariants.social && (
            <div>
              <h4 className="font-medium mb-3">Social Media</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-blue-600">Facebook</span>
                  <EditableText
                    value={editedVariants.social.facebook}
                    onChange={(value) => updateSocial('facebook', value)}
                    multiline
                    placeholder="Facebook post"
                    maxLength={500}
                    showCharCount
                    className="bg-blue-50 mt-1"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-pink-600">Instagram</span>
                  <EditableText
                    value={editedVariants.social.instagram}
                    onChange={(value) => updateSocial('instagram', value)}
                    multiline
                    placeholder="Instagram caption"
                    maxLength={300}
                    showCharCount
                    className="bg-pink-50 mt-1"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-600">LinkedIn</span>
                  <EditableText
                    value={editedVariants.social.linkedin}
                    onChange={(value) => updateSocial('linkedin', value)}
                    multiline
                    placeholder="LinkedIn post"
                    maxLength={400}
                    showCharCount
                    className="bg-blue-50 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}