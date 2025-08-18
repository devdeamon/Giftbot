import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function checkTelegramAuth(initData: string, botToken: string): boolean {
  const url = new URLSearchParams(initData)
  const hash = url.get("hash")
  if (!hash) return false

  url.delete("hash")

  const dataCheckString = Array.from(url.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
  const calcHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  return calcHash === hash
}

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json()
    const botToken = process.env.BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 })
    }

    const isValid = checkTelegramAuth(initData, botToken)
    return NextResponse.json({ ok: isValid })
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
