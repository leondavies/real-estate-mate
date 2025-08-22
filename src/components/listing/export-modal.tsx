"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  FileText, 
  Share2, 
  Globe,
  Download,
  Loader2
} from "lucide-react"

interface ExportModalProps {
  listing: any
  variants: any
  onClose: () => void
}

export function ExportModal({ listing, variants, onClose }: ExportModalProps) {
  const [activeFormat, setActiveFormat] = useState<'trademe' | 'realestate' | 'social' | 'copy' | 'pdf'>('trademe')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const exportFormats = [
    {
      id: 'trademe' as const,
      name: 'Trade Me',
      icon: <Globe className="h-4 w-4" />,
      description: 'Copy-ready content for Trade Me listings',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'realestate' as const,
      name: 'realestate.co.nz',
      icon: <Globe className="h-4 w-4" />,
      description: 'Formatted copy for realestate.co.nz',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'social' as const,
      name: 'Social Media',
      icon: <Share2 className="h-4 w-4" />,
      description: 'Ready-to-post social content',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'copy' as const,
      name: 'Print & Email',
      icon: <FileText className="h-4 w-4" />,
      description: 'Clean text for flyers and emails',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'pdf' as const,
      name: 'PDF Flyer',
      icon: <Download className="h-4 w-4" />,
      description: 'Professional PDF flyer with images',
      color: 'bg-orange-100 text-orange-800'
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const generatePdfFlyer = async () => {
    setGeneratingPdf(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}/flyer`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF flyer')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${listing.address.replace(/[^a-zA-Z0-9]/g, '_')}_flyer.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('PDF flyer downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF flyer. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const renderTradeMe = () => {
    const title = variants.headlines?.[0] || `${listing.bedrooms} bed ${listing.propertyType} in ${listing.suburb}`
    const description = variants.standard

    return (
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Trade Me Ready Copy
          </h4>
          <p className="text-sm text-green-700 mb-3">Copy and paste these sections into your Trade Me listing:</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Listing Title</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(title)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={title}
              readOnly
              className="min-h-[40px] text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Property Description</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(description)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={description}
              readOnly
              className="min-h-[120px] text-sm"
            />
          </div>

          {variants.bullets && variants.bullets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Key Features (Bullet Points)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(variants.bullets.join('\n• '))}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={`• ${variants.bullets.join('\n• ')}`}
                readOnly
                className="min-h-[80px] text-sm"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRealEstate = () => {
    const title = variants.headlines?.[0] || `${listing.bedrooms} bed ${listing.propertyType} in ${listing.suburb}`
    const description = variants.long || variants.standard

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            realestate.co.nz Ready Copy
          </h4>
          <p className="text-sm text-blue-700 mb-3">Optimized formatting for realestate.co.nz listings:</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Property Headline</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(title)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={title}
              readOnly
              className="min-h-[40px] text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Detailed Description</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(description)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={description}
              readOnly
              className="min-h-[120px] text-sm"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderSocial = () => {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media Posts
          </h4>
          <p className="text-sm text-purple-700 mb-3">Ready-to-post content for social platforms:</p>
        </div>

        <div className="space-y-4">
          {variants.social?.facebook && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Facebook Post</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(variants.social.facebook)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={variants.social.facebook}
                readOnly
                className="min-h-[80px] text-sm"
              />
            </div>
          )}

          {variants.social?.instagram && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Instagram Caption</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(variants.social.instagram)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={variants.social.instagram}
                readOnly
                className="min-h-[80px] text-sm"
              />
            </div>
          )}

          {variants.social?.linkedin && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">LinkedIn Post</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(variants.social.linkedin)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={variants.social.linkedin}
                readOnly
                className="min-h-[80px] text-sm"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCopy = () => {
    const cleanText = `${variants.headlines?.[0] || `${listing.bedrooms} bed ${listing.propertyType} in ${listing.suburb}`}

${variants.standard}

Key Features:
${variants.bullets ? variants.bullets.map((bullet: string) => `• ${bullet}`).join('\n') : 'No features listed'}

Property Details:
• ${listing.bedrooms} bedrooms
• ${listing.bathrooms} bathrooms
${listing.parking ? `• ${listing.parking} parking spaces` : ''}
${listing.floorAreaM2 ? `• ${listing.floorAreaM2}m² floor area` : ''}
${listing.landAreaM2 ? `• ${listing.landAreaM2}m² land area` : ''}

Location: ${listing.address}, ${listing.suburb}, ${listing.city}`

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Clean Text Format
          </h4>
          <p className="text-sm text-gray-700 mb-3">Perfect for email signatures, flyers, and general use:</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Complete Listing Text</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(cleanText)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </Button>
          </div>
          <Textarea
            value={cleanText}
            readOnly
            className="min-h-[200px] text-sm"
          />
        </div>
      </div>
    )
  }

  const renderPdf = () => {
    return (
      <div className="space-y-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Professional PDF Flyer
          </h4>
          <p className="text-sm text-orange-700 mb-3">Generate a professional PDF flyer with your property images and details:</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h5 className="font-medium mb-3">What's included in your flyer:</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Property headline and description
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Key features and property details
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Professional layout with branding
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Space for property images
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Contact details and QR code
              </li>
            </ul>
          </div>

          <Button
            onClick={generatePdfFlyer}
            disabled={generatingPdf}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF Flyer
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            PDF will be automatically downloaded to your device
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeFormat) {
      case 'trademe':
        return renderTradeMe()
      case 'realestate':
        return renderRealEstate()
      case 'social':
        return renderSocial()
      case 'copy':
        return renderCopy()
      case 'pdf':
        return renderPdf()
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Export Listing</h2>
              <p className="text-gray-600">{listing.address}, {listing.suburb}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Format Selection */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <h3 className="font-medium mb-3">Export Format</h3>
            <div className="space-y-2">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setActiveFormat(format.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {format.icon}
                    <span className="font-medium">{format.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{format.description}</p>
                  <Badge className={`mt-1 ${format.color}`} variant="secondary">
                    Ready
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}