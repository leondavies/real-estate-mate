import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generatePropertyFlyer } from "@/lib/pdf/flyer-generator"

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

    if (!listing.variantsJson) {
      return NextResponse.json(
        { error: "Please generate listing copy first" },
        { status: 400 }
      )
    }

    // Prepare flyer data
    const flyerData = {
      listing: {
        address: listing.address,
        suburb: listing.suburb,
        city: listing.city,
        propertyType: listing.propertyType,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        parking: listing.parking,
        floorAreaM2: listing.floorAreaM2,
        landAreaM2: listing.landAreaM2,
        cv: listing.cv,
        rv: listing.rv,
        featuresJson: listing.featuresJson,
      },
      variants: listing.variantsJson as any,
      images: listing.images || [],
      agent: {
        name: user.name || "Real Estate Agent",
        phone: "Contact for details",
        email: user.email,
        agency: "RealEstateMate",
      },
    }

    // Generate PDF
    const pdf = await generatePropertyFlyer(flyerData)
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${listing.address.replace(/[^a-zA-Z0-9]/g, '_')}_flyer.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating flyer:", error)
    return NextResponse.json({ 
      error: "Failed to generate flyer", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}