import { type NextRequest, NextResponse } from "next/server"
import { userData, getUserData } from "@/src/bot"
import { getEnvVar } from "@/lib/env"
import crypto from "crypto"

function validateTelegramInitData(initData: string, botToken: string): any {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get("hash")
    urlParams.delete("hash")

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    if (calculatedHash !== hash) {
      return null
    }

    const user = urlParams.get("user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("[v0] Telegram validation error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, telegramInitData } = body

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 })
    }

    let telegramUser = null
    if (telegramInitData) {
      telegramUser = validateTelegramInitData(telegramInitData, getEnvVar("BOT_TOKEN"))
      if (!telegramUser) {
        return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 })
      }
    }

    const telegramId = telegramUser?.id || data?.userId
    if (!telegramId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log(`[v0] Mining action for user ${telegramId}:`, action, data)

    switch (action) {
      case "startMining":
        const userInfo = getUserData(telegramId, telegramUser || {})
        userInfo.lastMiningStart = data.startTime || Date.now()
        userData.set(telegramId, userInfo)

        return NextResponse.json({
          success: true,
          startTime: userInfo.lastMiningStart,
          duration: data.duration || userInfo.miningDuration,
          message: "Mining started successfully",
        })

      case "completeMining":
        const user = userData.get(telegramId)
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const miningSpeed = data.miningSpeed || 0.000001
        const duration = data.duration || 1
        const baseChance = (miningSpeed * duration) / 24
        const levelMultiplier = Math.pow(1.5, data.minerLevel || 1)
        const finalChance = Math.min(baseChance * levelMultiplier, 0.1) // Cap at 10%

        const shardsFound = Math.random() < finalChance ? 1 : 0

        user.shards += shardsFound
        user.lastMiningStart = undefined
        userData.set(telegramId, user)

        if (process.env.NODE_ENV !== "development") {
          const { sendMiningNotification } = await import("@/src/bot")
          sendMiningNotification(
            telegramId,
            `⛏ MINING PROTOCOL COMPLETED\n\n` +
              `SHARDS_FOUND: ${shardsFound}\n` +
              `TOTAL_SHARDS: ${user.shards.toString().padStart(6, "0")}\n` +
              `STATUS: READY_FOR_RESTART\n\n` +
              `> RESTART_MINING_PROTOCOL <`,
          )
        }

        return NextResponse.json({
          success: true,
          shardsFound,
          totalShards: user.shards,
          message: shardsFound > 0 ? "GIFT shard found!" : "No shards found this session",
        })

      case "upgradeMiner":
        const upgradeUser = userData.get(telegramId)
        if (!upgradeUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const newLevel = data.newLevel || upgradeUser.minerLevel + 1
        const shardsSpent = data.shardsSpent || 0

        upgradeUser.minerLevel = newLevel
        upgradeUser.shards = Math.max(0, upgradeUser.shards - shardsSpent)
        userData.set(telegramId, upgradeUser)

        return NextResponse.json({
          success: true,
          newLevel: upgradeUser.minerLevel,
          remainingShards: upgradeUser.shards,
          message: "Miner upgraded successfully",
        })

      case "notifyBot":
        if (data.sessionCompleted && process.env.NODE_ENV !== "development") {
          const { sendMiningNotification } = await import("@/src/bot")
          sendMiningNotification(
            telegramId,
            `🎉 MINING SESSION COMPLETED!\n\n` +
              `SHARDS_FOUND: ${data.shardsFound || 0}\n` +
              `TOTAL_SHARDS: ${data.totalShards || 0}\n\n` +
              `> CONTINUE_MINING_PROTOCOL <`,
          )
        }

        return NextResponse.json({
          success: true,
          message: "Bot notified successfully",
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Mining API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
