"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ListingForm } from "@/components/forms/listing-form"
import { ImageUpload } from "@/components/listing/image-upload"
import { Facts } from "@/lib/schemas"

export default function NewListingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)
  const [images, setImages] = useState<any[]>([])
  const router = useRouter()

  const handleSubmit = async (data: Facts) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create listing")
      }

      const listing = await response.json()
      setCreatedListingId(listing.id)
      // Don't redirect immediately - let user add images first
    } catch (error) {
      console.error("Error creating listing:", error)
      alert("Failed to create listing. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (createdListingId) {
      router.push(`/listings/${createdListingId}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {createdListingId ? "Add Property Images" : "Create New Listing"}
          </h1>
          <p className="text-gray-600 mt-2">
            {createdListingId 
              ? "Upload property photos to enhance your listing"
              : "Enter your property details to generate professional listing copy"
            }
          </p>
        </div>

        {!createdListingId ? (
          <ListingForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <ImageUpload
              listingId={createdListingId}
              images={images}
              onImagesChange={setImages}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setCreatedListingId(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to edit details
              </button>
              <button
                onClick={handleContinue}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue to Listing →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}