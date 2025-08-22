import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const PROOF_SECRET = process.env.PROOF_SECRET || "dev-proof-secret-change-in-production"

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId

    // Get session data from database
    const sessions = await sql`
      SELECT * FROM mining_sessions 
      WHERE order_id = ${orderId} 
        AND status = 'completed'
      LIMIT 1
    `

    if (sessions.length === 0) {
      return NextResponse.json(
        {
          error: "Session not found or not completed",
        },
        { status: 404 },
      )
    }

    const session = sessions[0]

    // Create proof with server-side metrics
    const proof = {
      orderId,
      bytesRx: Number(session.bytes_received),
      bytesTx: Number(session.bytes_sent),
      loss: Number(session.loss_rate),
      jitter: Number(session.jitter_ms),
      timestamp: Date.now(),
    }

    // Sign the proof
    const signature = jwt.sign(proof, PROOF_SECRET, { expiresIn: "10m" })

    return NextResponse.json({
      ...proof,
      signature,
    })
  } catch (error) {
    console.error("Proof generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate proof",
      },
      { status: 500 },
    )
  }
}
