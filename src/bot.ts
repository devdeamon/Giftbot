import { Telegraf, Markup } from "telegraf"

const BOT_TOKEN = process.env.BOT_TOKEN!
const WEBAPP_URL = process.env.WEBAPP_URL!

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
}

const userData = new Map<number, UserData>()

function getUserData(telegramId: number, userInfo: any): UserData {
  if (!userData.has(telegramId)) {
    userData.set(telegramId, {
      telegramId,
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      username: userInfo.username,
      isPremium: userInfo.is_premium,
      shards: 0,
      minerLevel: 1,
      miningDuration: 3600000, // 1 hour in milliseconds
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
      `MINER_LEVEL: LVL_${userInfo.minerLevel.toString().padStart(2, "0")}\n\n` +
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

// Launch bot
bot.launch()

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))

console.log("🤖 GIFT Shard Mining Bot is running...")

export { userData, getUserData }
