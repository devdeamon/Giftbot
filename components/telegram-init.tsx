"use client"
import { useEffect } from "react"

export function TelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp
    if (!tg) {
      console.log("[v0] Telegram WebApp not available")
      return
    }

    console.log("[v0] Initializing Telegram WebApp")
    tg.ready()
    tg.expand()
    tg.disableVerticalSwipes()
    tg.enableClosingConfirmation()

    // Set colors to match app theme
    tg.setHeaderColor("#000000")
    tg.setBackgroundColor("#000000")

    // Configure MainButton
    if (tg.MainButton) {
      tg.MainButton.color = "#000000"
      tg.MainButton.textColor = "#00ff00"
    }

    // Haptic feedback on init
    if (tg.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred("heavy")
    }

    console.log("[v0] Telegram WebApp initialized successfully")
  }, [])

  return null
}
