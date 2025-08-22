import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const WORK_SECRET = process.env.WORK_SECRET || "dev-work-secret-change-in-production"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Check rate limiting - max 1 work order per minute per user
    const recentSessions = await sql`
      SELECT COUNT(*) as count 
      FROM mining_sessions 
      WHERE user_id = ${userId} 
        AND created_at > NOW() - INTERVAL '1 minute'
        AND status = 'active'
    `

    if (Number(recentSessions[0].count) > 0) {
      return NextResponse.json(
        {
          error: "Rate limited - wait before requesting new work",
        },
        { status: 429 },
      )
    }

    // Create work order
    const order = {
      id: crypto.randomUUID(),
      targetMbps: Math.floor(Math.random() * 5) + 3, // 3-7 Mbps
      durationMs: 30000, // 30 seconds
      userId,
      createdAt: Date.now(),
    }

    // Sign the work order
    const token = jwt.sign(order, WORK_SECRET, { expiresIn: "5m" })

    // Store session in database
    await sql`
      INSERT INTO mining_sessions (id, user_id, order_id, target_mbps, duration_ms, status)
      VALUES (${crypto.randomUUID()}, ${userId}, ${order.id}, ${order.targetMbps}, ${order.durationMs}, 'active')
    `

    return NextResponse.json({
      ...order,
      token,
    })
  } catch (error) {
    console.error("Work order error:", error)
    return NextResponse.json(
      {
        error: "Failed to create work order",
      },
      { status: 500 },
    )
  }
}
