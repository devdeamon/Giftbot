import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, action, data } = body

    if (!telegramId || !action) {
      return NextResponse.json({ error: "Telegram ID and action required" }, { status: 400 })
    }

    console.log(`[v0] Mining action for user ${telegramId}:`, action, data)

    switch (action) {
      case "start":
        return NextResponse.json({
          success: true,
          startTime: Date.now(),
          message: "Mining started successfully",
        })

      case "collect":
        const shardsFound = Math.random() < 0.1 ? 1 : 0 // 10% chance
        return NextResponse.json({
          success: true,
          shardsFound,
          message: shardsFound > 0 ? "GIFT shard found!" : "No shards found this session",
        })

      case "upgrade":
        return NextResponse.json({
          success: true,
          newLevel: (data?.currentLevel || 1) + 1,
          message: "Miner upgraded successfully",
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
