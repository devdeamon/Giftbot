import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { orderId, bytesRx, bytesTx, sessionDuration } = await req.json()

    // Simulate server-side metrics (in real implementation, this comes from WebRTC peer)
    const loss = Math.random() * 0.05 // 0-5% loss
    const jitter = Math.random() * 50 // 0-50ms jitter

    // Update session with completed metrics
    await sql`
      UPDATE mining_sessions 
      SET status = 'completed',
          completed_at = NOW(),
          bytes_received = ${bytesRx},
          bytes_sent = ${bytesTx},
          loss_rate = ${loss},
          jitter_ms = ${jitter}
      WHERE order_id = ${orderId}
    `

    return NextResponse.json({
      ok: true,
      metrics: { loss, jitter, bytesRx, bytesTx },
    })
  } catch (error) {
    console.error("Session update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update session",
      },
      { status: 500 },
    )
  }
}
