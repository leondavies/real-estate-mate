import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { mapToTradeMe } from "@/lib/mappers/trademe"
import { mapToRealEstate } from "@/lib/mappers/realestate"

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

    const { format } = await req.json()

    const listing = await db.listing.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only export their own listings
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
        { error: "Listing copy not generated yet" },
        { status: 400 }
      )
    }

    let exportData
    switch (format) {
      case "trademe":
        exportData = mapToTradeMe(listing, listing.variantsJson as any)
        break
      case "realestate":
        exportData = mapToRealEstate(listing, listing.variantsJson as any)
        break
      default:
        return NextResponse.json(
          { error: "Unsupported export format" },
          { status: 400 }
        )
    }

    const exportPackage = await db.exportPackage.create({
      data: {
        listingId: params.id,
        format,
        payloadJson: exportData,
      },
    })

    return NextResponse.json({
      exportId: exportPackage.id,
      format,
      data: exportData,
    })
  } catch (error) {
    console.error("Error exporting listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}