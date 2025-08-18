import { type NextRequest, NextResponse } from "next/server"
import { userData, getUserData } from "@/src/bot"
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const telegramId = searchParams.get("telegramId")
  const initData = searchParams.get("initData")

  let validatedUser = null
  if (initData) {
    validatedUser = validateTelegramInitData(initData, process.env.BOT_TOKEN!)
    if (!validatedUser) {
      return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 })
    }
  }

  const userId = validatedUser?.id || (telegramId ? Number.parseInt(telegramId) : null)
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  const userInfo = userData.get(userId)

  if (!userInfo) {
    if (validatedUser) {
      const newUserData = getUserData(userId, validatedUser)
      const responseData = {
        telegramId: newUserData.telegramId,
        shards: newUserData.shards,
        minerLevel: newUserData.minerLevel,
        lastMiningStart: newUserData.lastMiningStart,
        miningDuration: newUserData.miningDuration,
        isPremium: newUserData.isPremium || false,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        username: newUserData.username,
      }
      return NextResponse.json(responseData)
    }

    // Return default user data if no valid Telegram data
    const defaultUserData = {
      telegramId: userId,
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
    const { telegramId, shards, minerLevel, lastMiningStart, action, telegramInitData } = body

    let validatedUser = null
    if (telegramInitData) {
      validatedUser = validateTelegramInitData(telegramInitData, process.env.BOT_TOKEN!)
      if (!validatedUser) {
        return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 })
      }
    }

    const userId = validatedUser?.id || telegramId
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const userInfo = getUserData(userId, validatedUser || {})

    if (shards !== undefined) userInfo.shards = shards
    if (minerLevel !== undefined) userInfo.minerLevel = minerLevel
    if (lastMiningStart !== undefined) userInfo.lastMiningStart = lastMiningStart

    userData.set(userId, userInfo)

    console.log(`[v0] Updated user ${userId}:`, {
      shards: userInfo.shards,
      minerLevel: userInfo.minerLevel,
      lastMiningStart: userInfo.lastMiningStart,
    })

    if (action === "mining_completed" && userInfo) {
      console.log(`[v0] Mining completed for user ${userId}`)

      // Send bot notification if not in development
      if (process.env.NODE_ENV !== "development") {
        const { sendMiningNotification } = await import("@/src/bot")
        sendMiningNotification(
          userId,
          `⛏ MINING PROTOCOL COMPLETED\n\n` +
            `OPERATOR: ${userInfo.firstName}\n` +
            `TOTAL_SHARDS: ${userInfo.shards.toString().padStart(6, "0")}\n` +
            `STATUS: READY_FOR_RESTART\n\n` +
            `> RESTART_MINING_PROTOCOL <`,
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "User data updated successfully",
      userData: userInfo,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
