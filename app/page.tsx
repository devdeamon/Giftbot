"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Terminal, Activity, User, Wifi, WifiOff } from "lucide-react"
import { runProbe, type MiningResult } from "@/app/lib/probe"

// ---- Telegram typings ----
interface TelegramWebApp {
  initData: string
  initDataUnsafe: any
  version: string
  platform: string
  colorScheme: "light" | "dark"
  themeParams: any
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  isClosingConfirmationEnabled: boolean
  isFullscreen: boolean
  safeAreaInset: { top: number; bottom: number; left: number; right: number }
  contentSafeAreaInset: { top: number; bottom: number; left: number; right: number }
  requestFullscreen: () => void
  exitFullscreen: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  setBottomBarColor: (color: string) => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  enableVerticalSwipes: () => void
  disableVerticalSwipes: () => void
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

// ---- Game types ----
interface MinerStats {
  level: number
  shardsFound: number
  totalScore: number // Added total score tracking
  miningSpeed: number // shards per day
  maxWorkTime: number // hours
  upgradeCost: number
}

interface MiningSession {
  isActive: boolean
  startTime: number
  endTime: number
  timeRemaining: number
  currentBytes?: number
  targetMbps?: number
  progress?: number
  orderId?: string
}

interface TelegramUser {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

// ---- Storage helpers ----
const LS_KEYS = {
  miner: "gift_mining_miner_stats",
  session: "gift_mining_session",
  lastTick: "gift_last_tick", // Added for lazy calculation
} as const

const loadLS = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const saveLS = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

let saveThrottleTimeout: NodeJS.Timeout | null = null
const saveThrottled = (k: string, v: unknown) => {
  if (saveThrottleTimeout) clearTimeout(saveThrottleTimeout)
  saveThrottleTimeout = setTimeout(() => {
    saveLS(k, v)
    saveThrottleTimeout = null
  }, 10000) // Save every 10 seconds max
}

// ---- Utils ----
const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export default function GiftMiningGame() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [botStatus, setBotStatus] = useState<"connecting" | "connected" | "error">("connecting")

  const [minerStats, setMinerStats] = useState<MinerStats>(() =>
    loadLS<MinerStats>("gift_mining_miner_stats", {
      level: 1,
      shardsFound: 0,
      totalScore: 0,
      miningSpeed: 0.000001, // shards per day
      maxWorkTime: 1, // 1 hour
      upgradeCost: 10,
    }),
  )

  const [miningSession, setMiningSession] = useState<MiningSession>(() =>
    loadLS<MiningSession>("gift_mining_session", {
      isActive: false,
      startTime: 0,
      endTime: 0,
      timeRemaining: 0,
    }),
  )

  const [miningProgress, setMiningProgress] = useState({ sent: 0, received: 0, progress: 0 })
  const [lastMiningResult, setLastMiningResult] = useState<MiningResult | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "mining" | "claiming" | "error">(
    "idle",
  )

  const [isRealMining, setIsRealMining] = useState(false)

  // Keep MainButton handler exact reference
  const mainButtonHandlerRef = useRef<(() => void) | null>(null)

  const haptic = (style: "light" | "medium" | "heavy" = "medium") => {
    webApp?.HapticFeedback?.impactOccurred(style)
  }

  const notify = (type: "success" | "warning" | "error") => {
    webApp?.HapticFeedback?.notificationOccurred(type)
  }

  // ----- Bootstrap Telegram WebApp -----
  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return
    const tg = window.Telegram.WebApp
    setWebApp(tg)

    tg.ready()
    tg.expand()

    tg.setHeaderColor?.("#000000")
    tg.setBackgroundColor?.("#000000")
    tg.setBottomBarColor?.("#000000")

    tg.MainButton?.setParams({
      color: "#000000",
      text_color: "#00ff00",
      is_visible: false,
      is_active: true,
    })

    tg.requestFullscreen?.()
    tg.disableVerticalSwipes?.()
    tg.enableClosingConfirmation?.()

    if (tg.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user)
      setBotStatus("connected")
    } else {
      setBotStatus("error")
    }

    // theme vars
    if (tg.themeParams) {
      const root = document.documentElement
      root.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color || "#000000")
      root.style.setProperty("--tg-theme-text-color", tg.themeParams.text_color || "#00ff00")
      root.style.setProperty("--tg-theme-hint-color", tg.themeParams.hint_color || "#008000")
      root.style.setProperty("--tg-theme-button-color", tg.themeParams.button_color || "#00ff00")
      root.style.setProperty("--tg-theme-button-text-color", tg.themeParams.button_text_color || "#000000")
    }

    // safe areas
    const root = document.documentElement
    if (tg.safeAreaInset) {
      root.style.setProperty("--tg-safe-area-inset-top", `${tg.safeAreaInset.top}px`)
      root.style.setProperty("--tg-safe-area-inset-bottom", `${tg.safeAreaInset.bottom}px`)
      root.style.setProperty("--tg-safe-area-inset-left", `${tg.safeAreaInset.left}px`)
      root.style.setProperty("--tg-safe-area-inset-right", `${tg.safeAreaInset.right}px`)
    }
    if (tg.contentSafeAreaInset) {
      root.style.setProperty("--tg-content-safe-area-inset-top", `${tg.contentSafeAreaInset.top}px`)
      root.style.setProperty("--tg-content-safe-area-inset-bottom", `${tg.contentSafeAreaInset.bottom}px`)
      root.style.setProperty("--tg-content-safe-area-inset-left", `${tg.contentSafeAreaInset.left}px`)
      root.style.setProperty("--tg-content-safe-area-inset-right", `${tg.contentSafeAreaInset.right}px`)
    }

    setIsReady(true)

    const now = Date.now()
    const lastTick = loadLS<number>(LS_KEYS.lastTick, now)
    const deltaTime = Math.max(0, now - lastTick)

    if (miningSession.isActive && miningSession.endTime > now) {
      // Session still active, calculate progress
      const perMs = minerStats.miningSpeed / (24 * 60 * 60 * 1000)
      const gained = deltaTime * perMs
      if (gained > 0) {
        setMinerStats((prev) => ({ ...prev, shardsFound: prev.shardsFound + gained }))
      }
      setMiningSession((prev) => ({ ...prev, timeRemaining: prev.endTime - now }))
    } else if (miningSession.isActive && miningSession.endTime <= now) {
      // Session completed while offline
      const sessionDuration = miningSession.endTime - miningSession.startTime
      const perMs = minerStats.miningSpeed / (24 * 60 * 60 * 1000)
      const totalGained = sessionDuration * perMs
      if (totalGained > 0) {
        setMinerStats((prev) => ({ ...prev, shardsFound: prev.shardsFound + totalGained }))
      }
      setMiningSession({ isActive: false, startTime: 0, endTime: 0, timeRemaining: 0 })
      notify("success") // Notify completion
    }

    saveLS(LS_KEYS.lastTick, now)

    const handleVisibilityChange = () => {
      if (document.hidden) return

      const currentTime = Date.now()
      const prevTick = loadLS<number>(LS_KEYS.lastTick, currentTime)
      const timeDelta = Math.max(0, currentTime - prevTick)

      if (miningSession.isActive && miningSession.endTime > currentTime) {
        const perMs = minerStats.miningSpeed / (24 * 60 * 60 * 1000)
        const gained = timeDelta * perMs
        if (gained > 0) {
          setMinerStats((prev) => ({ ...prev, shardsFound: prev.shardsFound + gained }))
        }
      }

      saveLS(LS_KEYS.lastTick, currentTime)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      tg.disableClosingConfirmation?.()
      tg.enableVerticalSwipes?.()
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // remove main button handler if any
      if (mainButtonHandlerRef.current) {
        tg.MainButton?.offClick(mainButtonHandlerRef.current)
        mainButtonHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    saveThrottled(LS_KEYS.miner, minerStats)
  }, [minerStats])

  useEffect(() => {
    saveThrottled(LS_KEYS.session, miningSession)
  }, [miningSession])

  // ----- Manage closing confirmation based on mining state -----
  useEffect(() => {
    if (!webApp) return

    if (miningSession.isActive) {
      webApp.enableClosingConfirmation?.()
    } else {
      webApp.disableClosingConfirmation?.()
    }

    webApp.disableVerticalSwipes?.()
  }, [webApp, miningSession.isActive])

  // ----- MainButton (single actual handler via ref) -----
  useEffect(() => {
    if (!webApp?.MainButton) return

    // remove previous
    if (mainButtonHandlerRef.current) {
      webApp.MainButton.offClick(mainButtonHandlerRef.current)
      mainButtonHandlerRef.current = null
    }

    const handler = () => {
      if (!isRealMining) startMining()
    }
    mainButtonHandlerRef.current = handler
    webApp.MainButton.onClick(handler)

    return () => {
      if (mainButtonHandlerRef.current) {
        webApp.MainButton?.offClick(mainButtonHandlerRef.current)
        mainButtonHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webApp])

  // ----- Actions -----
  const startMining = async () => {
    if (miningSession.isActive || isRealMining) return
    haptic("medium")

    setIsRealMining(true)
    setConnectionStatus("connecting")

    try {
      // Get user ID from Telegram
      const userId = telegramUser?.id?.toString() || "demo-user"

      // Request work order first
      const workResponse = await fetch("/api/mining/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!workResponse.ok) {
        throw new Error("Failed to get work order")
      }

      const workOrder = await workResponse.json()
      console.log("[v0] Got work order:", workOrder)

      setConnectionStatus("mining")
      setMiningSession({
        isActive: true,
        startTime: Date.now(),
        endTime: Date.now() + workOrder.durationMs,
        timeRemaining: workOrder.durationMs,
        targetMbps: workOrder.targetMbps,
        orderId: workOrder.id,
      })

      // Start real mining probe
      const result = await runProbe({
        wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081",
        apiBase: "/api",
        token: webApp?.initData || "demo-token",
        onProgress: (progress) => {
          setMiningProgress(progress)
          // Update session with real progress
          setMiningSession((prev) => ({
            ...prev,
            currentBytes: progress.sent,
            progress: progress.progress,
          }))
        },
      })

      console.log("[v0] Mining completed:", result)
      setLastMiningResult(result)
      setConnectionStatus("claiming")

      if (result.claim.ok && result.claim.addedScore) {
        // Update stats with real mining results
        setMinerStats((prev) => ({
          ...prev,
          shardsFound: prev.shardsFound + result.claim.addedScore!,
          totalScore: prev.totalScore + result.claim.addedScore!,
        }))
        notify("success")
      } else {
        notify("error")
      }
    } catch (error) {
      console.error("[v0] Mining failed:", error)
      setConnectionStatus("error")
      notify("error")
    } finally {
      setIsRealMining(false)
      setConnectionStatus("idle")
      setMiningSession({
        isActive: false,
        startTime: 0,
        endTime: 0,
        timeRemaining: 0,
      })
    }
  }

  const upgradeMiner = () => {
    if (minerStats.shardsFound < minerStats.upgradeCost) {
      notify("error") // Added haptic feedback
      return
    }

    notify("success") // Added haptic feedback

    setMinerStats((prev) => ({
      level: prev.level + 1,
      shardsFound: prev.shardsFound - prev.upgradeCost,
      totalScore: prev.totalScore,
      miningSpeed: prev.miningSpeed * 2,
      maxWorkTime: Math.min(prev.maxWorkTime + 1, 8),
      upgradeCost: Math.floor(prev.upgradeCost * 2.5),
    }))
  }

  const handleButtonClick = (callback: () => void) => {
    webApp?.HapticFeedback.selectionChanged() // Added haptic feedback
    callback()
  }

  // ----- Derived -----
  const totalDurationMs = miningSession.endTime - miningSession.startTime
  const progressPercentage =
    isRealMining && miningSession.progress
      ? miningSession.progress * 100
      : miningSession.isActive
        ? ((totalDurationMs - miningSession.timeRemaining) / totalDurationMs) * 100
        : 0

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-4 flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <Terminal className="w-16 h-16 mx-auto animate-pulse" />
          <div className="text-xl">INITIALIZING_PROTOCOL...</div>
          <div className="text-xs text-green-700">
            {"█".repeat(10)}
            {"░".repeat(10)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen bg-black overflow-y-auto"
      style={{
        overflowY: "auto",
        touchAction: "pan-y", // Better touch handling
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "auto",
        height: "100vh",
        maxHeight: "100vh",
        paddingTop: "max(80px, env(safe-area-inset-top), var(--tg-safe-area-inset-top, 60px))",
        paddingBottom: "max(20px, env(safe-area-inset-bottom), var(--tg-safe-area-inset-bottom, 20px))",
        paddingLeft: "max(16px, env(safe-area-inset-left), var(--tg-safe-area-inset-left, 16px))",
        paddingRight: "max(16px, env(safe-area-inset-right), var(--tg-safe-area-inset-right, 16px))",
      }}
    >
      <div
        className="text-green-400 space-y-6 font-mono pb-32"
        style={{
          minHeight: "calc(100vh + 200px)",
        }}
      >
        <div className="px-4">
          <div className="text-center space-y-2 border border-green-400/30 p-4 bg-black/50">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-green-600 text-sm">01</span>
              <h1 className="text-2xl font-bold text-green-400 tracking-wider flex items-center justify-center gap-2">
                <Terminal className="text-green-400" />
                GIFT SHARD MINER {">>>>>>>>"}
              </h1>
              <span className="text-green-600 text-sm">01</span>
            </div>
            <p className="text-green-600 text-xs uppercase tracking-widest">DEEP MINING PROTOCOL ACTIVE</p>

            {telegramUser && (
              <div className="flex items-center justify-center gap-2 text-xs text-green-700 mt-2">
                <User className="w-3 h-3" />
                <span>OPERATOR: {telegramUser.first_name || "UNKNOWN"}</span>
                {telegramUser.username && <span>@{telegramUser.username}</span>}
              </div>
            )}

            <div className="text-xs text-green-700 mt-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>BOT: {botStatus.toUpperCase()}</div>
                <div>PROTOCOL: v2.1.0</div>
                <div>PLATFORM: {webApp?.platform?.toUpperCase() || "WEB"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-black border-green-400/30 border">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-xs text-green-600 uppercase tracking-wider">TOTAL_SCORE</div>
                  <div className="text-3xl font-bold text-green-400 font-mono">{minerStats.totalScore.toFixed(6)}</div>
                  <div className="text-xs text-green-700">
                    {"#".repeat(Math.min(10, Math.floor(minerStats.totalScore)))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-400/30 border">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-xs text-green-600 uppercase tracking-wider">MINER_LEVEL</div>
                  <div className="text-3xl font-bold text-green-400 font-mono">
                    LVL_{minerStats.level.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-green-700">
                    {"▓".repeat(Math.min(10, minerStats.level))}
                    {"░".repeat(Math.max(0, 10 - Math.min(10, minerStats.level)))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mining */}
        <div className="px-4">
          <Card className="bg-black border-green-400/30 border">
            <CardHeader className="border-b border-green-400/20">
              <CardTitle className="flex items-center justify-between text-green-400">
                <div className="flex items-center gap-2">
                  {connectionStatus === "idle" ? (
                    <WifiOff className="text-green-700" />
                  ) : (
                    <Wifi className={isRealMining ? "animate-pulse text-green-400" : "text-green-700"} />
                  )}
                  REAL_MINING_PROTOCOL
                </div>
                <div className="text-xs text-green-600">[{connectionStatus.toUpperCase()}]</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {isRealMining ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-xs text-green-600 uppercase tracking-wider">
                      {connectionStatus === "mining" ? "TRAFFIC_GENERATION" : connectionStatus.toUpperCase()}
                    </div>
                    {connectionStatus === "mining" && (
                      <>
                        <div className="text-2xl font-mono text-green-400 tracking-wider">
                          {miningSession.targetMbps}Mbps TARGET
                        </div>
                        <div className="text-xs text-green-700">
                          SENT: {(miningProgress.sent / 1024 / 1024).toFixed(2)}MB | RX:{" "}
                          {(miningProgress.received / 1024 / 1024).toFixed(2)}MB
                        </div>
                      </>
                    )}
                    <div className="text-xs text-green-700">PROGRESS: {Math.floor(progressPercentage)}%</div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2 bg-green-900/30" />
                    <div className="text-xs text-green-700 text-center">
                      {"█".repeat(Math.floor(progressPercentage / 5))}
                      {"░".repeat(20 - Math.floor(progressPercentage / 5))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                      <Activity className="w-3 h-3 mr-1 animate-pulse" />
                      REAL_TRAFFIC_ACTIVE
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-700 space-y-2">
                    <div className="text-6xl">🌐</div>
                    <div className="text-xs uppercase tracking-wider">WEBRTC_MINER: STANDBY</div>
                    <div className="text-xs">
                      {"> "} REAL_TRAFFIC_GENERATION_READY {"<"}
                    </div>
                  </div>
                  {lastMiningResult && (
                    <div className="text-xs text-green-700 font-mono border border-green-400/20 p-2">
                      LAST: {(lastMiningResult.sent / 1024 / 1024).toFixed(2)}MB | SCORE: +
                      {lastMiningResult.claim.addedScore?.toFixed(6) || 0}
                    </div>
                  )}
                  <div className="text-xs text-green-700 font-mono border border-green-400/20 p-2">
                    CONTROL_VIA_TELEGRAM_MAIN_BUTTON
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diagnostics */}
        <div className="px-4">
          <Card className="bg-black border-green-400/30 border">
            <CardHeader className="border-b border-green-400/20">
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Zap className="text-green-400" />
                SYSTEM_DIAGNOSTICS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
                  <span className="text-green-600 uppercase">MINING_SPEED:</span>
                  <span className="text-green-400 font-mono">{minerStats.miningSpeed.toFixed(6)}_SHARDS/DAY</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
                  <span className="text-green-600 uppercase">WORK_DURATION:</span>
                  <span className="text-green-400 font-mono">
                    {minerStats.maxWorkTime.toString().padStart(2, "0")}_HOURS
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
                  <span className="text-green-600 uppercase">SUCCESS_RATE:</span>
                  <span className="text-green-400 font-mono">
                    {(((minerStats.miningSpeed * minerStats.maxWorkTime) / 24) * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
              <div className="text-center text-xs text-green-700 mt-4">
                {"[".repeat(10)} SYSTEM_OPTIMAL {"]".repeat(10)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade */}
        <div className="px-4">
          <Card className="bg-black border-green-400/30 border">
            <CardHeader className="border-b border-green-400/20">
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="text-green-400" />
                UPGRADE_PROTOCOL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs">
                    <div className="text-green-400 uppercase font-mono">
                      LEVEL_{(minerStats.level + 1).toString().padStart(2, "0")}_UPGRADE
                    </div>
                    <div className="text-green-700 text-xs">{"> "} 2X_SPEED + 1HR_DURATION</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-mono text-lg">
                      {minerStats.upgradeCost.toString().padStart(4, "0")}
                    </div>
                    <div className="text-green-700 text-xs uppercase">SHARDS_REQ</div>
                  </div>
                </div>

                <div className="text-xs text-green-700 text-center">
                  COST: {"$".repeat(Math.min(20, Math.floor(minerStats.upgradeCost / 10)))}
                </div>
              </div>

              <Button
                onClick={() => handleButtonClick(upgradeMiner)}
                disabled={minerStats.shardsFound < minerStats.upgradeCost}
                className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider disabled:opacity-30 disabled:text-green-700 active:bg-green-400/30 transition-all duration-150"
                size="lg"
              >
                {"> "} EXECUTE_UPGRADE_PROTOCOL {"<"}
              </Button>

              {minerStats.shardsFound < minerStats.upgradeCost && (
                <div className="text-xs text-green-700 text-center font-mono">
                  ERROR: INSUFFICIENT_SHARDS [{minerStats.upgradeCost - minerStats.shardsFound}_REQUIRED]
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="px-4">
          <div className="text-center text-xs text-green-700 pt-4 border-t border-green-400/20">
            <div className="space-y-1">
              <p className="font-mono">
                {">"} DEEP_MINING_PROTOCOL_v2.1.0 {"<"}
              </p>
              <p className="text-green-800">KEEP_MINING_TO_DISCOVER_RARE_GIFT_SHARDS</p>
              {webApp && (
                <p className="text-green-900 text-xs">
                  TG_API: {webApp.version} | VIEWPORT: {Math.round(webApp.viewportHeight)}px
                </p>
              )}
              <div className="text-green-900">{"#".repeat(50)}</div>
            </div>
          </div>
        </div>

        <div className="h-32" />

        <div className="px-4">
          <div className="text-center text-xs text-green-800 space-y-2">
            <div className="border border-green-400/10 p-4">
              <p className="font-mono">
                {">"} SCROLL_TEST_AREA {"<"}
              </p>
              <p>IF_YOU_CAN_SEE_THIS_SCROLLING_WORKS</p>
              <div className="text-green-900">{"▼".repeat(20)}</div>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </div>
  )
}
