"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Eye,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles
} from "lucide-react"

interface ImageUploadProps {
  listingId: string
  images: Array<{
    id: string
    url: string
    order: number
    metaJson?: any
  }>
  onImagesChange: (images: any[]) => void
  onFeaturesDetected?: (features: string[]) => void
}

export function ImageUpload({ listingId, images, onImagesChange, onFeaturesDetected }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('order', (images.length + index).toString())

        const response = await fetch(`/api/listings/${listingId}/images`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        return response.json()
      })

      const newImages = await Promise.all(uploadPromises)
      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Some images failed to upload. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [listingId, images, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      onImagesChange(images.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image. Please try again.')
    }
  }

  const moveImage = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)

    // Update order numbers
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }))

    onImagesChange(updatedImages)

    // Update order in database
    try {
      await fetch(`/api/listings/${listingId}/images/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: updatedImages.map(img => ({ id: img.id, order: img.order }))
        }),
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  const analyzeImages = async () => {
    if (images.length === 0) {
      alert('Please upload some images first')
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch(`/api/listings/${listingId}/analyze-images`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to analyze images')
      }

      const result = await response.json()
      
      alert(`✨ AI detected ${result.detectedFeatures.length} features: ${result.detectedFeatures.join(', ')}`)
      
      // Notify parent component about detected features
      if (onFeaturesDetected) {
        onFeaturesDetected(result.detectedFeatures)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze images. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Property Images
            <Badge variant="outline">{images.length}/20</Badge>
          </CardTitle>
          {images.length > 0 && (
            <Button
              onClick={analyzeImages}
              disabled={analyzing}
              variant="outline"
              size="sm"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Analyze
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Uploading images...</span>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to select files
              </p>
              <p className="text-xs text-gray-400">
                Supports JPEG, PNG, WebP • Max 10MB per file • Up to 20 images
              </p>
            </div>
          )}
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .sort((a, b) => a.order - b.order)
              .map((image, index) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border bg-gray-50"
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedIndex !== null) {
                      moveImage(draggedIndex, index)
                      setDraggedIndex(null)
                    }
                  }}
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Order Badge */}
                    <Badge 
                      className="absolute top-2 left-2 bg-black/70 text-white"
                    >
                      {index + 1}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Move Buttons */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index - 1)}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(index, index + 1)}
                        disabled={index === images.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Primary Badge */}
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-green-500 text-white text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="p-2">
                    <p className="text-xs text-gray-500 truncate">
                      Image {index + 1}
                      {image.metaJson?.caption && ` • ${image.metaJson.caption}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tips */}
        {images.length === 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Photography Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• First image will be the primary listing photo</li>
              <li>• Include exterior, interior, and key feature shots</li>
              <li>• Use good lighting and high resolution</li>
              <li>• Drag to reorder images after upload</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}