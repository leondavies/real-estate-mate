import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { analyzeAllImages, consolidateFeatures } from "@/lib/ai/vision"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get listing with images
    const listing = await db.listing.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (!listing.images || listing.images.length === 0) {
      return NextResponse.json({ error: "No images to analyze" }, { status: 400 })
    }

    console.log("Analyzing images for listing:", listing.id)
    console.log("Number of images:", listing.images.length)

    // Extract image URLs (they're stored as base64 data URLs)
    const imageUrls = listing.images.map(img => img.url)

    // Analyze all images
    const analyses = await analyzeAllImages(imageUrls)
    
    // Consolidate features from all images
    const detectedFeatures = consolidateFeatures(analyses)
    
    console.log("Detected features:", detectedFeatures)

    // Get current features from listing
    const currentFeatures = listing.featuresJson || []
    
    // Merge detected features with existing ones (avoid duplicates)
    const mergedFeatures = [...new Set([...currentFeatures, ...detectedFeatures])]

    // Update listing with new features
    const updatedListing = await db.listing.update({
      where: { id: params.id },
      data: {
        featuresJson: mergedFeatures,
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json({
      detectedFeatures,
      allFeatures: mergedFeatures,
      analyses: analyses.map(analysis => ({
        roomType: analysis.roomType,
        style: analysis.style,
        condition: analysis.condition,
        suggestions: analysis.suggestions,
      })),
      listing: updatedListing,
    })
  } catch (error) {
    console.error("Error analyzing images:", error)
    return NextResponse.json({ 
      error: "Failed to analyze images", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}