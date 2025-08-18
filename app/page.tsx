"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, TrendingUp, Terminal, Activity, User } from "lucide-react"

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
  miningSpeed: number // shards per day
  maxWorkTime: number // hours
  upgradeCost: number
}

interface MiningSession {
  isActive: boolean
  startTime: number
  endTime: number
  timeRemaining: number
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

  const [minerStats, setMinerStats] = useState<MinerStats>(() =>
    loadLS<MinerStats>("gift_mining_miner_stats", {
      level: 1,
      shardsFound: 0,
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

  // Keep MainButton handler exact reference
  const mainButtonHandlerRef = useRef<(() => void) | null>(null)

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

    if (tg.initDataUnsafe?.user) setTelegramUser(tg.initDataUnsafe.user)

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

    // On mount, attempt to restore active session
    if (miningSession.isActive && miningSession.endTime > Date.now()) {
      setMiningSession((prev) => ({ ...prev, timeRemaining: prev.endTime - Date.now() }))
      tg.enableClosingConfirmation?.()
    } else if (miningSession.isActive) {
      // session expired while app was closed
      setMiningSession({ isActive: false, startTime: 0, endTime: 0, timeRemaining: 0 })
    }

    return () => {
      // ensure confirmation off on unmount
      tg.disableClosingConfirmation?.()
      tg.enableVerticalSwipes?.()

      // remove main button handler if any
      if (mainButtonHandlerRef.current) {
        tg.MainButton?.offClick(mainButtonHandlerRef.current)
        mainButtonHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ----- Persist miner stats & session -----
  useEffect(() => {
    saveLS(LS_KEYS.miner, minerStats)
  }, [minerStats])

  useEffect(() => {
    saveLS(LS_KEYS.session, miningSession)
  }, [miningSession])

  // ----- MainButton (single actual handler via ref) -----
  useEffect(() => {
    if (!webApp?.MainButton) return

    // remove previous
    if (mainButtonHandlerRef.current) {
      webApp.MainButton.offClick(mainButtonHandlerRef.current)
      mainButtonHandlerRef.current = null
    }

    if (miningSession.isActive) {
      webApp.MainButton.setText(`⛏ MINING... ${formatTime(miningSession.timeRemaining)}`)
      webApp.MainButton.setParams({ color: "#000000", text_color: "#00ff00", is_visible: true, is_active: false })
      webApp.MainButton.showProgress(false)
      webApp.enableClosingConfirmation?.()
    } else {
      webApp.MainButton.setText("> START MINING PROTOCOL <")
      webApp.MainButton.setParams({ color: "#000000", text_color: "#00ff00", is_visible: true, is_active: true })
      webApp.MainButton.hideProgress?.()
      webApp.disableClosingConfirmation?.()

      const handler = () => {
        if (miningSession.isActive) return
        startMining()
      }
      mainButtonHandlerRef.current = handler
      webApp.MainButton.onClick(handler)
    }

    // cleanup for safety
    return () => {
      if (mainButtonHandlerRef.current) {
        webApp.MainButton?.offClick(mainButtonHandlerRef.current)
        mainButtonHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webApp, miningSession.isActive, miningSession.timeRemaining])

  // ----- Mining timer -----
  useEffect(() => {
    if (!miningSession.isActive) return
    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, miningSession.endTime - now)

      if (remaining === 0) {
        setMiningSession({ isActive: false, startTime: 0, endTime: 0, timeRemaining: 0 })
        const found = Math.random() < (minerStats.miningSpeed * minerStats.maxWorkTime) / 24
        if (found) {
          setMinerStats((prev) => ({ ...prev, shardsFound: prev.shardsFound + 1 }))
          webApp?.HapticFeedback.notificationOccurred("success")
        } else {
          webApp?.HapticFeedback.impactOccurred("light")
        }
      } else {
        setMiningSession((prev) => ({ ...prev, timeRemaining: remaining }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [miningSession.isActive, miningSession.endTime, minerStats.miningSpeed, minerStats.maxWorkTime, webApp])

  // ----- Actions -----
  const startMining = () => {
    if (miningSession.isActive) return
    webApp?.HapticFeedback.impactOccurred("medium")

    const now = Date.now()
    const duration = minerStats.maxWorkTime * 60 * 60 * 1000

    setMiningSession({
      isActive: true,
      startTime: now,
      endTime: now + duration,
      timeRemaining: duration,
    })

    webApp?.MainButton.setText("⛏ MINING IN PROGRESS...")
    webApp?.MainButton.setParams({ is_active: false })
    webApp?.MainButton.showProgress(false)
  }

  const upgradeMiner = () => {
    if (minerStats.shardsFound < minerStats.upgradeCost) {
      webApp?.HapticFeedback.notificationOccurred("error")
      return
    }

    webApp?.HapticFeedback.notificationOccurred("success")

    setMinerStats((prev) => ({
      level: prev.level + 1,
      shardsFound: prev.shardsFound - prev.upgradeCost,
      miningSpeed: prev.miningSpeed * 2,
      maxWorkTime: Math.min(prev.maxWorkTime + 1, 8),
      upgradeCost: Math.floor(prev.upgradeCost * 2.5),
    }))
  }

  const handleButtonClick = (callback: () => void) => {
    webApp?.HapticFeedback.selectionChanged()
    callback()
  }

  // ----- Derived -----
  const totalDurationMs = minerStats.maxWorkTime * 60 * 60 * 1000
  const progressPercentage = miningSession.isActive
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
    <div className="min-h-screen bg-black overflow-y-auto">
      <div
        className="text-green-400 space-y-6 font-mono pb-24"
        style={{
          paddingTop: "max(80px, var(--tg-safe-area-inset-top, 60px), var(--tg-content-safe-area-inset-top, 60px))",
          paddingLeft: "max(var(--tg-safe-area-inset-left, 16px), var(--tg-content-safe-area-inset-left, 16px))",
          paddingRight: "max(var(--tg-safe-area-inset-right, 16px), var(--tg-content-safe-area-inset-right, 16px))",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
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
                <div>STATUS: ONLINE</div>
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
                  <div className="text-xs text-green-600 uppercase tracking-wider">SHARDS_FOUND</div>
                  <div className="text-3xl font-bold text-green-400 font-mono">
                    {minerStats.shardsFound.toString().padStart(6, "0")}
                  </div>
                  <div className="text-xs text-green-700">{"#".repeat(Math.min(10, minerStats.shardsFound))}</div>
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
                  <Activity className={miningSession.isActive ? "animate-pulse text-green-400" : "text-green-700"} />
                  MINING_PROTOCOL
                </div>
                <div className="text-xs text-green-600">{miningSession.isActive ? "[ACTIVE]" : "[IDLE]"}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {miningSession.isActive ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-xs text-green-600 uppercase tracking-wider">TIME_REMAINING</div>
                    <div className="text-4xl font-mono text-green-400 tracking-wider">
                      {formatTime(miningSession.timeRemaining)}
                    </div>
                    <div className="text-xs text-green-700">MINING_DEPTH: {Math.floor(progressPercentage)}%</div>
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
                      <Clock className="w-3 h-3 mr-1" />
                      PROTOCOL_ACTIVE
                    </Badge>
                  </div>
                  <div className="text-xs text-green-700 text-center">
                    {">"} USE_MAIN_BUTTON_FOR_CONTROL {"<"}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-700 space-y-2">
                    <div className="text-6xl">⛏</div>
                    <div className="text-xs uppercase tracking-wider">MINER_STATUS: STANDBY</div>
                    <div className="text-xs">
                      {"> "} USE_MAIN_BUTTON_TO_START {"<"}
                    </div>
                  </div>
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

        <div className="h-20" />
      </div>
    </div>
  )
}
