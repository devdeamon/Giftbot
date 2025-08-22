import { Telegraf, Markup } from "telegraf"

const BOT_TOKEN = process.env.BOT_TOKEN!
const WEBAPP_URL = process.env.WEBAPP_URL!

const bot = new Telegraf(BOT_TOKEN)

// Set menu button for WebApp
bot.telegram.setChatMenuButton({
  type: "web_app",
  text: "Open Miner",
  web_app: { url: WEBAPP_URL },
})

// Handle /start command
bot.start(async (ctx) => {
  await ctx.reply(
    "🔥 GIFT SHARD MINER is ready.\n\nStart mining rare GIFT shards using our advanced protocol!",
    Markup.inlineKeyboard([Markup.button.webApp("🚀 Open GIFT SHARD MINER", WEBAPP_URL)]),
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
