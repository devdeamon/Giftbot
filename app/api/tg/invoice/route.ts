import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { chat_id, title, description, payload, prices } = await req.json()
    const botToken = process.env.BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 })
    }

    const body = {
      chat_id,
      title,
      description,
      payload,
      provider_token: "", // Empty for Stars
      currency: "XTR", // Required for Stars
      prices, // [{ label, amount }]
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendInvoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create invoice" }, { status: 500 })
  }
}
