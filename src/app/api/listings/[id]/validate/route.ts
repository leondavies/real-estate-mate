import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { validateDraft } from "@/lib/ai/validator"
import { validateCompliance } from "@/lib/compliance"

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

    // Run AI validation
    const aiValidation = await validateDraft(facts, draft)

    // Run compliance validation
    const complianceResult = validateCompliance({
      address: listing.address,
      draftCopy: listing.draftCopy || undefined,
      variantsJson: listing.variantsJson,
      featuresJson: Array.isArray(listing.featuresJson) ? listing.featuresJson as string[] : [],
      notes: listing.notes || undefined,
      cv: listing.cv || undefined,
      rv: listing.rv || undefined
    })

    // Combine results
    const aiScore = aiValidation.compliance_score || 0
    const aiIsValid = aiValidation.unsupported.length === 0 && aiScore >= 80
    
    const combinedValidation = {
      ai: aiValidation,
      compliance: complianceResult,
      overall: {
        isValid: aiIsValid && complianceResult.isCompliant,
        canPublish: aiIsValid && complianceResult.score >= 80,
        combinedScore: Math.round(aiScore * 0.4 + complianceResult.score * 0.6)
      }
    }

    return NextResponse.json(combinedValidation)
  } catch (error) {
    console.error("Error validating draft:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}