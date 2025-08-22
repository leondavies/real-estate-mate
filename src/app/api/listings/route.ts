import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const CreateListingSchema = z.object({
  address: z.string().min(3),
  suburb: z.string().min(2),
  city: z.string().min(2),
  postcode: z.string().optional(),
  propertyType: z.enum(["house", "apartment", "townhouse", "unit", "section"]),
  bedrooms: z.number().int().min(0).max(15),
  bathrooms: z.number().int().min(0).max(10),
  parking: z.number().int().min(0).max(10).optional(),
  floorAreaM2: z.number().int().positive().optional(),
  landAreaM2: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1850).max(new Date().getFullYear()).optional(),
  cv: z.number().int().positive().optional(),
  rv: z.number().int().positive().optional(),
  featuresJson: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "",
          image: session.user.image,
          role: "agent",
        },
      })
    }

    const body = await req.json()
    const data = CreateListingSchema.parse(body)

    const listing = await db.listing.create({
      data: {
        ...data,
        userId: user.id,
        agencyId: user.agencyId,
        featuresJson: data.featuresJson || [],
        factsLockJson: data,
      },
    })

    return NextResponse.json(listing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
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

    const listings = await db.listing.findMany({
      where: { userId: user.id },
      include: { images: true },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}