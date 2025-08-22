export interface WorkOrder {
  id: string
  targetMbps: number
  durationMs: number
  token: string
  createdAt: number
}

export interface ProofResult {
  orderId: string
  bytesRx: number
  bytesTx: number
  loss: number
  jitter: number
  signature: string
}

export interface MiningResult {
  sent: number
  received: number
  duration: number
  claim: {
    ok: boolean
    addedScore?: number
    error?: string
  }
}

export async function runProbe({
  wsUrl,
  apiBase,
  token,
  onProgress,
}: {
  wsUrl: string
  apiBase: string
  token: string
  onProgress?: (progress: { sent: number; received: number; progress: number }) => void
}): Promise<MiningResult> {
  console.log("[v0] Starting WebRTC mining probe...")

  // 1. Connect to signaling server
  const ws = new WebSocket(`${wsUrl}?auth=${encodeURIComponent(token)}`)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
    setTimeout(() => reject(new Error("WebSocket timeout")), 10000)
  })

  console.log("[v0] WebSocket connected, requesting work order...")

  // 2. Request work order
  ws.send(JSON.stringify({ type: "want_work" }))
  const order: WorkOrder = await new Promise((resolve, reject) => {
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data.error) reject(new Error(data.error))
        else resolve(data)
      } catch (e) {
        reject(e)
      }
    }
    setTimeout(() => reject(new Error("Work order timeout")), 5000)
  })

  console.log("[v0] Received work order:", order)

  // 3. Setup WebRTC connection
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  })

  const dc = pc.createDataChannel("probe", {
    ordered: false,
    maxRetransmits: 0,
  })

  // Create offer and send to server
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  ws.send(
    JSON.stringify({
      type: "sdp",
      orderId: order.id,
      sdp: pc.localDescription,
    }),
  )

  // Wait for server answer
  const answer = await new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data.type === "sdp") resolve(data.sdp)
        else if (data.error) reject(new Error(data.error))
      } catch (e) {
        reject(e)
      }
    }
    setTimeout(() => reject(new Error("SDP answer timeout")), 10000)
  })

  await pc.setRemoteDescription(answer)

  // 4. Wait for data channel to open
  await new Promise<void>((resolve, reject) => {
    dc.onopen = () => resolve()
    dc.onerror = (e) => reject(e)
    setTimeout(() => reject(new Error("DataChannel timeout")), 10000)
  })

  console.log("[v0] DataChannel opened, starting traffic generation...")

  // 5. Generate traffic according to work order
  const chunkSize = 16 * 1024 // 16KB chunks
  const targetBps = order.targetMbps * 1_000_000
  const interval = 50 // 50ms intervals
  const bytesPerTick = Math.floor((targetBps / 1000) * interval)
  const packetsPerTick = Math.max(1, Math.floor(bytesPerTick / chunkSize))

  const payload = new Uint8Array(chunkSize)
  // Fill with random data to prevent compression
  crypto.getRandomValues(payload)

  let sent = 0
  let received = 0
  const startTime = performance.now()
  const endAt = startTime + order.durationMs

  // Track received data
  dc.onmessage = (event) => {
    received += event.data.byteLength || event.data.length || 0
  }

  // Main mining loop
  while (performance.now() < endAt && dc.readyState === "open") {
    for (let i = 0; i < packetsPerTick && dc.readyState === "open"; i++) {
      try {
        dc.send(payload)
        sent += payload.byteLength
      } catch (e) {
        console.warn("[v0] Send failed:", e)
        break
      }
    }

    // Report progress
    const progress = (performance.now() - startTime) / order.durationMs
    onProgress?.({ sent, received, progress: Math.min(progress, 1) })

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  const actualDuration = performance.now() - startTime
  console.log("[v0] Mining completed:", { sent, received, actualDuration })

  // 6. Close connections
  dc.close()
  pc.close()
  ws.close()

  // 7. Get proof from server and claim rewards
  try {
    const proofResponse = await fetch(`${apiBase}/mining/proof/${order.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!proofResponse.ok) {
      throw new Error(`Proof fetch failed: ${proofResponse.status}`)
    }

    const proof: ProofResult = await proofResponse.json()
    console.log("[v0] Received proof:", proof)

    const claimResponse = await fetch(`${apiBase}/mining/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(proof),
    })

    const claim = await claimResponse.json()
    console.log("[v0] Claim result:", claim)

    return {
      sent,
      received,
      duration: actualDuration,
      claim,
    }
  } catch (error) {
    console.error("[v0] Claim failed:", error)
    return {
      sent,
      received,
      duration: actualDuration,
      claim: { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
    }
  }
}
