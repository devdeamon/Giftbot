import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const telegramId = searchParams.get("telegramId")

  if (!telegramId) {
    return NextResponse.json({ error: "Telegram ID required" }, { status: 400 })
  }

  // In production, this would query a database
  // For now, return mock data based on telegramId
  const userData = {
    telegramId: Number.parseInt(telegramId),
    shards: 0,
    minerLevel: 1,
    lastMiningStart: null,
    miningDuration: 3600000, // 1 hour
    isPremium: false,
  }

  return NextResponse.json(userData)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, shards, minerLevel, lastMiningStart } = body

    if (!telegramId) {
      return NextResponse.json({ error: "Telegram ID required" }, { status: 400 })
    }

    // In production, this would update a database
    // For now, just return success
    console.log(`[v0] Updating user ${telegramId}:`, { shards, minerLevel, lastMiningStart })

    return NextResponse.json({
      success: true,
      message: "User data updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
