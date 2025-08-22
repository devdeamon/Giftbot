import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const PROOF_SECRET = process.env.PROOF_SECRET || "dev-proof-secret-change-in-production"

function calcScore(bytes: number, loss: number, jitter: number): number {
  const MiB = bytes / (1024 * 1024)
  const qualityFactor = Math.max(0.5, (1 - loss) * Math.max(0.5, 1 - jitter / 200))
  const deviceMultiplier = 1.0 // Could be based on device capabilities

  return Number((MiB * qualityFactor * deviceMultiplier).toFixed(6))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { signature, orderId, bytesRx, bytesTx, loss, jitter } = body

    // Verify proof signature
    let proof: any
    try {
      proof = jwt.verify(signature, PROOF_SECRET)
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid proof signature",
        },
        { status: 400 },
      )
    }

    // Validate proof data matches
    if (
      proof.orderId !== orderId ||
      Math.abs(proof.bytesRx - bytesRx) > 1024 || // Allow small variance
      proof.loss !== loss ||
      proof.jitter !== jitter
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Proof data mismatch",
        },
        { status: 400 },
      )
    }

    // Check if already claimed
    const existingPayouts = await sql`
      SELECT id FROM mining_payouts 
      WHERE proof_signature = ${signature}
      LIMIT 1
    `

    if (existingPayouts.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Proof already claimed",
        },
        { status: 400 },
      )
    }

    // Get session info
    const sessions = await sql`
      SELECT * FROM mining_sessions 
      WHERE order_id = ${orderId}
      LIMIT 1
    `

    if (sessions.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Session not found",
        },
        { status: 404 },
      )
    }

    const session = sessions[0]
    const userId = session.user_id

    // Calculate score
    const qualityScore = Math.max(0.5, (1 - loss) * Math.max(0.5, 1 - jitter / 200))
    const finalScore = calcScore(bytesRx, loss, jitter)

    // Create payout record
    await sql`
      INSERT INTO mining_payouts (
        user_id, session_id, bytes_processed, quality_score, 
        final_score, proof_signature
      ) VALUES (
        ${userId}, ${session.id}, ${bytesRx}, ${qualityScore}, 
        ${finalScore}, ${signature}
      )
    `

    // Update session status
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

    // Refresh materialized views for leaderboards
    try {
      await sql`REFRESH MATERIALIZED VIEW daily_leaderboard`
      await sql`REFRESH MATERIALIZED VIEW weekly_leaderboard`
    } catch (e) {
      console.warn("Failed to refresh leaderboard views:", e)
    }

    return NextResponse.json({
      ok: true,
      addedScore: finalScore,
      qualityScore,
      bytesProcessed: bytesRx,
    })
  } catch (error) {
    console.error("Claim processing error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process claim",
      },
      { status: 500 },
    )
  }
}
