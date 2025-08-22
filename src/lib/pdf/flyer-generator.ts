import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export interface FlyerData {
  listing: {
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
  }
  variants: {
    headlines: string[]
    standard: string
    bullets: string[]
  }
  images: Array<{
    url: string
    order: number
  }>
  agent?: {
    name: string
    phone: string
    email: string
    agency: string
  }
}

async function addImageFromBase64(pdf: jsPDF, base64Data: string, x: number, y: number, width: number, height: number) {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Determine image format from the data URL or default to JPEG
    let format = 'JPEG'
    if (base64Data.includes('data:image/png')) format = 'PNG'
    if (base64Data.includes('data:image/webp')) format = 'WEBP'
    
    pdf.addImage(base64, format, x, y, width, height)
  } catch (error) {
    console.warn('Failed to add image to PDF:', error)
    // Fallback: draw a placeholder rectangle
    pdf.setFillColor(240, 240, 240)
    pdf.rect(x, y, width, height, 'F')
    pdf.setTextColor(120, 120, 120)
    pdf.setFontSize(10)
    pdf.text('Image not available', x + 5, y + height / 2)
  }
}

export async function generatePropertyFlyer(data: FlyerData): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // Modern color palette
  const darkBlue = '#0F172A'    // slate-900
  const primaryBlue = '#1E40AF'  // blue-700
  const lightBlue = '#E0F2FE'    // sky-100
  const accentGreen = '#059669'  // emerald-600
  const lightGray = '#F8FAFC'    // slate-50
  const textGray = '#334155'     // slate-700
  const lightText = '#64748B'    // slate-500

  let yPosition = margin

  // Clean property header
  pdf.setTextColor(15, 23, 42) // darkBlue
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  
  const address = data.listing.address
  pdf.text(address, margin, yPosition)
  
  yPosition += 8
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 116, 139) // lightText
  const location = `${data.listing.suburb}, ${data.listing.city}`
  pdf.text(location, margin, yPosition)
  
  yPosition += 15

  // Main property image (larger and more prominent)
  const imageHeight = 90
  if (data.images && data.images.length > 0) {
    const primaryImage = data.images.find(img => img.order === 0) || data.images[0]
    if (primaryImage && primaryImage.url) {
      try {
        await addImageFromBase64(pdf, primaryImage.url, margin, yPosition, contentWidth, imageHeight)
      } catch (error) {
        // Fallback to styled placeholder
        pdf.setFillColor(226, 232, 240)
        pdf.roundedRect(margin, yPosition, contentWidth, imageHeight, 5, 5, 'F')
        pdf.setTextColor(100, 116, 139)
        pdf.setFontSize(12)
        pdf.text('Property Image', margin + 10, yPosition + imageHeight/2)
      }
    }
  } else {
    // Modern placeholder design
    pdf.setFillColor(240, 249, 255) // light blue
    pdf.roundedRect(margin, yPosition, contentWidth, imageHeight, 5, 5, 'F')
    
    // Add border
    pdf.setDrawColor(191, 219, 254) // blue-200
    pdf.setLineWidth(1)
    pdf.roundedRect(margin, yPosition, contentWidth, imageHeight, 5, 5, 'S')
    
    // Centered icon and text
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const placeholderText = 'Professional Property Photography'
    const placeholderX = (pageWidth - pdf.getTextWidth(placeholderText)) / 2
    pdf.text(placeholderText, placeholderX, yPosition + imageHeight/2)
  }
  
  yPosition += imageHeight + 20

  // Two-column layout for content
  const columnWidth = (contentWidth - 10) / 2
  const leftColumnX = margin
  const rightColumnX = margin + columnWidth + 10

  // Left column - Description
  pdf.setTextColor(51, 65, 85) // textGray
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Property Description', leftColumnX, yPosition)
  
  let leftYPosition = yPosition + 10
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(71, 85, 105) // slate-600
  
  const description = data.variants.standard
  const descLines = pdf.splitTextToSize(description, columnWidth)
  pdf.text(descLines, leftColumnX, leftYPosition)
  leftYPosition += descLines.length * 4 + 15

  // Key features in left column
  if (data.variants.bullets && data.variants.bullets.length > 0) {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(51, 65, 85)
    pdf.text('Key Features', leftColumnX, leftYPosition)
    
    leftYPosition += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105)
    
    // Create two columns of features if many features
    const features = data.variants.bullets.slice(0, 12)
    const featuresPerColumn = Math.ceil(features.length / 2)
    
    features.slice(0, featuresPerColumn).forEach((bullet, index) => {
      pdf.setFillColor(5, 150, 105) // Green bullet
      pdf.circle(leftColumnX + 2, leftYPosition + index * 5 - 1, 0.5, 'F')
      pdf.text(bullet, leftColumnX + 6, leftYPosition + index * 5)
    })
    
    if (features.length > featuresPerColumn) {
      const secondColumnStart = leftYPosition
      features.slice(featuresPerColumn).forEach((bullet, index) => {
        pdf.setFillColor(5, 150, 105)
        pdf.circle(leftColumnX + columnWidth/2 + 2, secondColumnStart + index * 5 - 1, 0.5, 'F')
        pdf.text(bullet, leftColumnX + columnWidth/2 + 6, secondColumnStart + index * 5)
      })
    }
  }

  // Right column - Property details card  
  let rightYPosition = yPosition
  
  // Property details card with modern styling - make it more compact
  const cardY = rightYPosition
  const cardHeight = 90 // Reduced height
  
  pdf.setFillColor(248, 250, 252) // light background
  pdf.roundedRect(rightColumnX, cardY, columnWidth, cardHeight, 5, 5, 'F')
  
  // Card header
  pdf.setFillColor(30, 64, 175) // primaryBlue
  pdf.roundedRect(rightColumnX, cardY, columnWidth, 20, 5, 5, 'F') // Reduced header height
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Property Details', rightColumnX + 8, cardY + 12)

  // Property details content - more compact
  rightYPosition = cardY + 28
  pdf.setTextColor(51, 65, 85)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')

  const details = [
    ['Type:', data.listing.propertyType.charAt(0).toUpperCase() + data.listing.propertyType.slice(1)],
    ['Beds:', data.listing.bedrooms.toString()],
    ['Baths:', data.listing.bathrooms.toString()],
    ...(data.listing.parking ? [['Parking:', data.listing.parking.toString()]] : []),
    ...(data.listing.floorAreaM2 ? [['Floor:', `${data.listing.floorAreaM2}m²`]] : []),
    ...(data.listing.landAreaM2 ? [['Land:', `${data.listing.landAreaM2}m²`]] : [])
  ]

  details.slice(0, 6).forEach(([label, value], index) => { // Limit to 6 items
    const y = rightYPosition + index * 6.5
    pdf.setFont('helvetica', 'bold')
    pdf.text(label, rightColumnX + 8, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(value, rightColumnX + 35, y)
  })

  // Property values section if available - more compact
  if (data.listing.cv || data.listing.rv) {
    rightYPosition += 100 // Position below the details card
    
    pdf.setFillColor(224, 242, 254) // light blue background
    pdf.roundedRect(rightColumnX, rightYPosition, columnWidth, 30, 5, 5, 'F')
    
    pdf.setTextColor(30, 64, 175)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Valuation', rightColumnX + 8, rightYPosition + 10)
    
    pdf.setTextColor(51, 65, 85)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    
    let valY = rightYPosition + 18
    if (data.listing.cv) {
      pdf.text(`CV: $${data.listing.cv.toLocaleString()}`, rightColumnX + 8, valY)
    }
    if (data.listing.rv) {
      pdf.text(`RV: $${data.listing.rv.toLocaleString()}`, rightColumnX + 8, valY + 8)
    }
  }

  // Calculate footer position to ensure content doesn't get cut off
  // Add some padding from the last content
  yPosition = Math.max(yPosition, pageHeight - 80) // Ensure minimum space for footer
  
  // Modern footer with contact information
  const footerY = pageHeight - 40
  
  // Footer background
  pdf.setFillColor(15, 23, 42) // darkBlue
  pdf.rect(0, footerY, pageWidth, 40, 'F')
  
  // Agent information
  pdf.setTextColor(255, 255, 255)
  
  if (data.agent) {
    // Agent name and contact in single line format
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.agent.name, margin, footerY + 15)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${data.agent.agency} • Phone: ${data.agent.phone}`, margin, footerY + 28)
    
  } else {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RealEstateMate', margin, footerY + 15)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Professional Property Marketing Platform', margin, footerY + 28)
  }

  // Generate QR code for the property listing
  const listingUrl = `https://realestatemate.com/listing/${data.listing.address.replace(/\s+/g, '-').toLowerCase()}`
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(listingUrl, {
      width: 60,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Add QR code to PDF
    const qrSize = 25
    const qrX = pageWidth - margin - qrSize - 5
    const qrY = footerY + 8
    
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    
    // QR code label
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(200, 200, 200)
    pdf.text('Scan for details', qrX - 5, qrY + qrSize + 8)
    
  } catch (error) {
    console.warn('Failed to generate QR code:', error)
    // Fallback to placeholder
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(pageWidth - margin - 30, footerY + 8, 25, 25, 2, 2, 'F')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(6)
    pdf.text('QR CODE', pageWidth - margin - 24, footerY + 18)
  }

  // Modern contact info on the right (repositioned to avoid QR code)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 200, 200)
  pdf.text('Generated with RealEstateMate', pageWidth - margin - 80, footerY + 15)

  return pdf
}

export async function downloadFlyer(flyerData: FlyerData): Promise<void> {
  const pdf = await generatePropertyFlyer(flyerData)
  const filename = `${flyerData.listing.address.replace(/[^a-zA-Z0-9]/g, '_')}_flyer.pdf`
  pdf.save(filename)
}