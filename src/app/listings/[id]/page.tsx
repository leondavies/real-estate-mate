"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListingEditor } from "@/components/listing/listing-editor"
import { ExportModal } from "@/components/listing/export-modal"
import { ImageUpload } from "@/components/listing/image-upload"
import { Sparkles, Download, Share, AlertTriangle, Edit, Image as ImageIcon, Save, CheckCircle, ArrowLeft } from "lucide-react"

interface Listing {
  id: string
  address: string
  suburb: string
  city: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  parking?: number
  floorAreaM2?: number
  landAreaM2?: number
  cv?: number
  rv?: number
  featuresJson?: string[]
  notes?: string
  draftCopy?: string
  variantsJson?: any
  status: string
  createdAt: string
  images?: Array<{
    id: string
    url: string
    order: number
  }>
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImages, setShowImages] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchListing(params.id as string)
    }
  }, [params.id])

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch listing")
      }
      const data = await response.json()
      setListing(data)
    } catch (error) {
      console.error("Error fetching listing:", error)
      setError("Failed to load listing")
    }
  }

  const generateCopy = async () => {
    if (!listing) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}/generate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate copy")
      }

      const variants = await response.json()
      setListing(prev => prev ? {
        ...prev,
        variantsJson: variants,
        draftCopy: variants.standard,
        status: "draft_ready"
      } : null)
    } catch (error) {
      console.error("Error generating copy:", error)
      alert("Failed to generate copy. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveVariants = async (variants: any) => {
    if (!listing) return

    const response = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantsJson: variants,
        draftCopy: variants.standard,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save changes")
    }

    setListing(prev => prev ? {
      ...prev,
      variantsJson: variants,
      draftCopy: variants.standard,
    } : null)
  }

  const publishListing = async () => {
    if (!listing) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "published",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish listing")
      }

      setListing(prev => prev ? {
        ...prev,
        status: "published",
      } : null)

      alert("Listing published successfully! 🎉")
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Error publishing listing:", error)
      alert("Failed to publish listing. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{listing.address}</h1>
            <p className="text-gray-600 text-lg">{listing.suburb}, {listing.city}</p>
            <Badge variant={listing.status === "draft_ready" ? "default" : "secondary"} className="mt-2">
              {listing.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-2">
            {!listing.variantsJson ? (
              <Button onClick={generateCopy} disabled={isGenerating}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Copy"}
              </Button>
            ) : (
              <>
                <Button 
                  variant={showImages ? 'default' : 'outline'}
                  onClick={() => setShowImages(!showImages)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {showImages ? 'Hide Images' : 'Manage Images'}
                </Button>
                <Button 
                  variant={viewMode === 'edit' ? 'default' : 'outline'}
                  onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {viewMode === 'edit' ? 'View Mode' : 'Edit Mode'}
                </Button>
                <Button variant="outline" onClick={() => setShowExportModal(true)}>
                  <Share className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={generateCopy} disabled={isGenerating}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                {listing.status !== "published" && (
                  <Button 
                    onClick={publishListing} 
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {listing.status === "published" ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSaving ? "Publishing..." : listing.status === "published" ? "Published" : "Save & Publish"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {showImages && (
          <ImageUpload
            listingId={listing.id}
            images={listing.images || []}
            onImagesChange={(newImages) => setListing(prev => prev ? {...prev, images: newImages} : null)}
            onFeaturesDetected={(features) => {
              // Update listing with detected features
              setListing(prev => {
                if (!prev) return null
                const currentFeatures = prev.featuresJson || []
                const newFeatures = [...new Set([...currentFeatures, ...features])]
                return {...prev, featuresJson: newFeatures}
              })
            }}
          />
        )}

        {!listing.variantsJson ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 text-lg">No copy generated yet</p>
              <p className="text-sm mt-2 text-gray-400">Click "Generate Copy" to create AI-powered listing content</p>
            </CardContent>
          </Card>
        ) : viewMode === 'edit' ? (
          <ListingEditor
            listing={listing}
            variants={listing.variantsJson}
            onSave={saveVariants}
            onRegenerate={generateCopy}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Property Facts */}
            <Card>
              {/* Primary Image */}
              {listing.images && listing.images.length > 0 && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {(() => {
                    const primaryImage = listing.images.find(img => img.order === 0) || listing.images[0]
                    return (
                      <img
                        src={primaryImage.url}
                        alt={`${listing.address} property photo`}
                        className="w-full h-full object-cover"
                      />
                    )
                  })()}
                </div>
              )}
              
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <p className="text-lg capitalize">{listing.propertyType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bedrooms</span>
                    <p className="text-lg">{listing.bedrooms}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bathrooms</span>
                    <p className="text-lg">{listing.bathrooms}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Parking</span>
                    <p className="text-lg">{listing.parking || "N/A"}</p>
                  </div>
                </div>

                {(listing.floorAreaM2 || listing.landAreaM2) && (
                  <div className="grid grid-cols-2 gap-4">
                    {listing.floorAreaM2 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Floor Area</span>
                        <p className="text-lg">{listing.floorAreaM2}m²</p>
                      </div>
                    )}
                    {listing.landAreaM2 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Land Area</span>
                        <p className="text-lg">{listing.landAreaM2}m²</p>
                      </div>
                    )}
                  </div>
                )}

                {(listing.cv || listing.rv) && (
                  <div className="grid grid-cols-2 gap-4">
                    {listing.cv && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">CV</span>
                        <p className="text-lg">${listing.cv.toLocaleString()}</p>
                      </div>
                    )}
                    {listing.rv && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">RV</span>
                        <p className="text-lg">${listing.rv.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {listing.featuresJson && listing.featuresJson.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Features</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {listing.featuresJson.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Notes</span>
                    <p className="text-sm mt-1 text-gray-600">{listing.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Copy - View Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Copy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Headlines */}
                  <div>
                    <h4 className="font-medium mb-2">Headlines</h4>
                    <div className="space-y-2">
                      {listing.variantsJson.headlines?.map((headline: string, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {headline}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standard Copy */}
                  <div>
                    <h4 className="font-medium mb-2">Standard Copy</h4>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm">{listing.variantsJson.standard}</p>
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {listing.variantsJson.bullets?.map((bullet: string, index: number) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Social Content */}
                  {listing.variantsJson.social && (
                    <div>
                      <h4 className="font-medium mb-2">Social Media</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          <strong>Facebook:</strong> {listing.variantsJson.social.facebook}
                        </div>
                        <div className="p-2 bg-pink-50 rounded text-sm">
                          <strong>Instagram:</strong> {listing.variantsJson.social.instagram}
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          <strong>LinkedIn:</strong> {listing.variantsJson.social.linkedin}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && listing && listing.variantsJson && (
          <ExportModal
            listing={listing}
            variants={listing.variantsJson}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  )
}