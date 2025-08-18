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

export async function POST(request: NextRequest) {
  try {
    const { action, taskId, reward, telegramInitData } = await request.json()

    if (action === "claimReward") {
      let telegramUser = null
      if (telegramInitData) {
        telegramUser = validateTelegramInitData(telegramInitData, process.env.BOT_TOKEN!)
        if (!telegramUser) {
          return NextResponse.json({ success: false, error: "Invalid Telegram data" }, { status: 401 })
        }
      }

      if (!telegramUser?.id) {
        return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
      }

      if (taskId && reward && typeof reward === "number" && reward > 0) {
        const userInfo = getUserData(telegramUser.id, telegramUser)

        // Validate task completion based on current user stats
        let isTaskCompleted = false
        switch (taskId) {
          case "mine_session":
            isTaskCompleted = userInfo.lastMiningStart !== undefined || (userInfo as any).completedSessions > 0
            break
          case "collect_shards":
            isTaskCompleted = userInfo.shards >= 10
            break
          case "upgrade_miner":
            isTaskCompleted = userInfo.minerLevel >= 3
            break
          case "master_miner":
            isTaskCompleted = userInfo.minerLevel >= 10
            break
          default:
            isTaskCompleted = false
        }

        if (!isTaskCompleted) {
          return NextResponse.json(
            {
              success: false,
              error: "Task not completed",
            },
            { status: 400 },
          )
        }

        userInfo.shards += reward
        userData.set(telegramUser.id, userInfo)

        if (process.env.NODE_ENV !== "development") {
          const { sendMiningNotification } = await import("@/src/bot")
          sendMiningNotification(
            telegramUser.id,
            `🎉 TASK COMPLETED!\n\n` +
              `REWARD_EARNED: +${reward.toString().padStart(6, "0")}\n` +
              `TOTAL_SHARDS: ${userInfo.shards.toString().padStart(6, "0")}\n\n` +
              `> CONTINUE_MINING_PROTOCOL <`,
          )
        }

        return NextResponse.json({
          success: true,
          taskId,
          reward,
          totalShards: userInfo.shards,
          message: "Reward claimed successfully",
        })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Task API error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
