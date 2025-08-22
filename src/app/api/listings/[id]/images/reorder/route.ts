import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { images } = await req.json()

    // Update all image orders in a transaction
    await db.$transaction(
      images.map((img: { id: string; order: number }) =>
        db.image.update({
          where: { id: img.id },
          data: { order: img.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering images:", error)
    return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 })
  }
}