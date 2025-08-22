import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const CreateBrandVoiceSchema = z.object({
  name: z.string().min(1),
  tone: z.string().default("professional"),
  guidelines: z.string().min(10),
  examples: z.string().optional(),
})

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

    const brandVoices = await db.brandVoice.findMany({
      where: {
        OR: [
          { userId: user.id },
          { 
            AND: [
              { agencyId: user.agencyId },
              { agencyId: { not: null } }
            ]
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(brandVoices)
  } catch (error) {
    console.error("Error fetching brand voices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const data = CreateBrandVoiceSchema.parse(body)

    const brandVoice = await db.brandVoice.create({
      data: {
        ...data,
        userId: user.id,
        agencyId: user.agencyId,
      },
    })

    return NextResponse.json(brandVoice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating brand voice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}