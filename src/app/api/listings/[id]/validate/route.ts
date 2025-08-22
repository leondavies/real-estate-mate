import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { validateDraft } from "@/lib/ai/validator"

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

    const listing = await db.listing.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const facts = listing.factsLockJson || {}
    const draft = listing.draftCopy || ""

    const validation = await validateDraft(facts, draft)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("Error validating draft:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}