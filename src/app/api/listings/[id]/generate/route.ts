import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateListingCopy } from "@/lib/ai/generator"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== GENERATE COPY START ===")
  console.log("Listing ID:", params.id)
  
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

    console.log("Fetching listing from database...")
    const listing = await db.listing.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only generate copy for their own listings
      },
      include: {
        images: true,
      },
    })

    console.log("Listing found:", !!listing)
    if (!listing) {
      console.log("No listing found with ID:", params.id)
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    console.log("Building facts object...")
    const facts = (listing.factsLockJson as any) || {
      address: listing.address,
      suburb: listing.suburb,
      city: listing.city,
      propertyType: listing.propertyType,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      parking: listing.parking,
      floorAreaM2: listing.floorAreaM2,
      landAreaM2: listing.landAreaM2,
      yearBuilt: listing.yearBuilt,
      cv: listing.cv,
      rv: listing.rv,
      features: listing.featuresJson,
      notes: listing.notes,
    }

    console.log("Facts object:", JSON.stringify(facts, null, 2))
    
    console.log("Calling generateListingCopy...")
    const variants = await generateListingCopy(facts)
    console.log("Generated variants:", JSON.stringify(variants, null, 2))

    console.log("Updating listing in database...")
    await db.listing.update({
      where: { id: params.id },
      data: {
        variantsJson: variants,
        draftCopy: variants.standard,
        status: "draft_ready",
      },
    })

    console.log("=== GENERATE COPY SUCCESS ===")
    return NextResponse.json(variants)
  } catch (error) {
    console.error("=== GENERATE COPY ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    
    return NextResponse.json({ 
      error: "Failed to generate listing copy", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}