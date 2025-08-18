import { Telegraf, Markup } from "telegraf"
import { getEnvVar } from "@/lib/env"

const BOT_TOKEN = getEnvVar("BOT_TOKEN")
const WEBAPP_URL = getEnvVar("WEBAPP_URL")

const bot = new Telegraf(BOT_TOKEN)

interface UserData {
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  isPremium?: boolean
  shards: number
  minerLevel: number
  lastMiningStart?: number
  miningDuration: number
  completedSessions?: number
  totalMiningTime?: number
}

const userData = new Map<number, UserData>()

function getUserData(telegramId: number, userInfo: any): UserData {
  if (!userData.has(telegramId)) {
    userData.set(telegramId, {
      telegramId,
      firstName: userInfo.first_name || "Unknown",
      lastName: userInfo.last_name,
      username: userInfo.username,
      isPremium: userInfo.is_premium,
      shards: 0,
      minerLevel: 1,
      miningDuration: 3600000, // 1 hour in milliseconds
      completedSessions: 0,
      totalMiningTime: 0,
    })
  }
  return userData.get(telegramId)!
}

// Set menu button for WebApp
bot.telegram.setChatMenuButton({
  type: "web_app",
  text: "Open Miner",
  web_app: { url: WEBAPP_URL },
})

bot.start(async (ctx) => {
  const user = ctx.from
  const userInfo = getUserData(user.id, user)

  const greeting = user.first_name ? `Welcome back, ${user.first_name}!` : "Welcome, Operator!"
  const premiumStatus = user.is_premium ? "🌟 PREMIUM" : "STANDARD"

  await ctx.reply(
    `🔥 ${greeting}\n\n` +
      `STATUS: ONLINE\n` +
      `ACCOUNT: ${premiumStatus}\n` +
      `SHARDS_FOUND: ${userInfo.shards.toString().padStart(6, "0")}\n` +
      `MINER_LEVEL: LVL_${userInfo.minerLevel.toString().padStart(2, "0")}\n` +
      `SESSIONS_COMPLETED: ${(userInfo.completedSessions || 0).toString().padStart(3, "0")}\n\n` +
      `DEEP MINING PROTOCOL ACTIVE\n` +
      `Start mining rare GIFT shards using our advanced protocol!`,
    Markup.inlineKeyboard([Markup.button.webApp("🚀 OPEN GIFT SHARD MINER", WEBAPP_URL)]),
  )
})

bot.command("stats", async (ctx) => {
  const user = ctx.from
  const userInfo = getUserData(user.id, user)

  const isCurrentlyMining = userInfo.lastMiningStart && Date.now() - userInfo.lastMiningStart < userInfo.miningDuration

  await ctx.reply(
    `📊 MINING STATISTICS\n\n` +
      `OPERATOR: ${user.first_name || "Unknown"}\n` +
      `ACCOUNT: ${user.is_premium ? "🌟 PREMIUM" : "STANDARD"}\n` +
      `SHARDS_FOUND: ${userInfo.shards.toString().padStart(6, "0")}\n` +
      `MINER_LEVEL: LVL_${userInfo.minerLevel.toString().padStart(2, "0")}\n` +
      `SESSIONS_COMPLETED: ${(userInfo.completedSessions || 0).toString().padStart(3, "0")}\n` +
      `TOTAL_MINING_TIME: ${Math.floor((userInfo.totalMiningTime || 0) * 10) / 10}h\n` +
      `STATUS: ${isCurrentlyMining ? "[ACTIVE]" : "[IDLE]"}\n\n` +
      `> USE_MAIN_BUTTON_FOR_CONTROL <`,
    Markup.inlineKeyboard([Markup.button.webApp("⛏ Open Miner", WEBAPP_URL)]),
  )
})

// Optional: /app command
bot.command("app", async (ctx) => {
  await ctx.reply(
    "⛏ Open the mining interface:",
    Markup.inlineKeyboard([Markup.button.webApp("Open Miner", WEBAPP_URL)]),
  )
})

bot.on("web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data)
    const user = ctx.from
    const userInfo = getUserData(user.id, user)

    switch (data.action) {
      case "update_mining":
        userInfo.shards = data.shards || userInfo.shards
        userInfo.minerLevel = data.minerLevel || userInfo.minerLevel
        userInfo.lastMiningStart = data.lastMiningStart
        userInfo.completedSessions = data.completedSessions || userInfo.completedSessions
        userInfo.totalMiningTime = data.totalMiningTime || userInfo.totalMiningTime
        userData.set(user.id, userInfo)

        await ctx.answerWebAppQuery({
          type: "article",
          id: "mining_update",
          title: "Mining Updated",
          input_message_content: {
            message_text: `⛏ Mining progress updated!\nShards: ${userInfo.shards}\nLevel: ${userInfo.minerLevel}\nSessions: ${userInfo.completedSessions}`,
          },
        })
        break

      case "claim_reward":
        const reward = data.reward || 0
        userInfo.shards += reward
        userData.set(user.id, userInfo)

        await ctx.reply(
          `🎉 REWARD CLAIMED!\n\n` +
            `SHARDS_EARNED: +${reward.toString().padStart(6, "0")}\n` +
            `TOTAL_SHARDS: ${userInfo.shards.toString().padStart(6, "0")}\n\n` +
            `> PROTOCOL_STATUS: ACTIVE <`,
        )
        break

      case "mining_completed":
        userInfo.completedSessions = (userInfo.completedSessions || 0) + 1
        userInfo.totalMiningTime = (userInfo.totalMiningTime || 0) + (data.sessionDuration || 1)
        userData.set(user.id, userInfo)

        await ctx.reply(
          `⛏ MINING SESSION COMPLETED!\n\n` +
            `OPERATOR: ${user.first_name}\n` +
            `SHARDS_FOUND: ${data.shardsFound || 0}\n` +
            `TOTAL_SHARDS: ${userInfo.shards.toString().padStart(6, "0")}\n` +
            `SESSIONS_COMPLETED: ${userInfo.completedSessions.toString().padStart(3, "0")}\n\n` +
            `> RESTART_MINING_PROTOCOL <`,
        )
        break
    }
  } catch (error) {
    console.error("WebApp data error:", error)
  }
})

export function sendMiningNotification(telegramId: number, message: string) {
  bot.telegram.sendMessage(telegramId, message).catch((error) => {
    console.error(`[v0] Failed to send notification to ${telegramId}:`, error)
  })
}

setInterval(() => {
  userData.forEach((user, telegramId) => {
    if (user.lastMiningStart) {
      const miningTime = Date.now() - user.lastMiningStart
      if (miningTime >= user.miningDuration) {
        // Mining session completed
        sendMiningNotification(
          telegramId,
          `⛏ MINING PROTOCOL COMPLETED\n\n` +
            `OPERATOR: ${user.firstName}\n` +
            `SESSION_TIME: ${Math.floor(user.miningDuration / 60000)} minutes\n` +
            `TOTAL_SESSIONS: ${(user.completedSessions || 0) + 1}\n` +
            `STATUS: READY_FOR_RESTART\n\n` +
            `> RESTART_MINING_PROTOCOL <`,
        )
        user.lastMiningStart = undefined
        user.completedSessions = (user.completedSessions || 0) + 1
        userData.set(telegramId, user)
      }
    }
  })
}, 60000) // Check every minute

// Launch bot
bot.launch()

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))

console.log("🤖 GIFT Shard Mining Bot is running...")

export { userData, getUserData }
