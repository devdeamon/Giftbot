import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getAvailableGifts`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch gifts" }, { status: 500 })
  }
}
