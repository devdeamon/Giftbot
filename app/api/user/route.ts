import { type NextRequest, NextResponse } from "next/server"
import { userData } from "@/src/bot"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const telegramId = searchParams.get("telegramId")

  if (!telegramId) {
    return NextResponse.json({ error: "Telegram ID required" }, { status: 400 })
  }

  const userInfo = userData.get(Number.parseInt(telegramId))

  if (!userInfo) {
    // Return default user data if not found
    const defaultUserData = {
      telegramId: Number.parseInt(telegramId),
      shards: 0,
      minerLevel: 1,
      lastMiningStart: null,
      miningDuration: 3600000, // 1 hour
      isPremium: false,
    }
    return NextResponse.json(defaultUserData)
  }

  const responseData = {
    telegramId: userInfo.telegramId,
    shards: userInfo.shards,
    minerLevel: userInfo.minerLevel,
    lastMiningStart: userInfo.lastMiningStart,
    miningDuration: userInfo.miningDuration,
    isPremium: userInfo.isPremium || false,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    username: userInfo.username,
  }

  return NextResponse.json(responseData)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, shards, minerLevel, lastMiningStart, action } = body

    if (!telegramId) {
      return NextResponse.json({ error: "Telegram ID required" }, { status: 400 })
    }

    const userInfo = userData.get(telegramId)
    if (userInfo) {
      if (shards !== undefined) userInfo.shards = shards
      if (minerLevel !== undefined) userInfo.minerLevel = minerLevel
      if (lastMiningStart !== undefined) userInfo.lastMiningStart = lastMiningStart

      userData.set(telegramId, userInfo)

      console.log(`[v0] Updated user ${telegramId}:`, {
        shards: userInfo.shards,
        minerLevel: userInfo.minerLevel,
        lastMiningStart: userInfo.lastMiningStart,
      })
    }

    if (action === "mining_completed" && userInfo) {
      // This could trigger bot notifications in the future
      console.log(`[v0] Mining completed for user ${telegramId}`)
    }

    return NextResponse.json({
      success: true,
      message: "User data updated successfully",
      userData: userInfo,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
