"use client"

import { Home, Wallet, CheckSquare, Trophy } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface NavigationPanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onTabClick?: () => void
}

export function NavigationPanel({ activeTab, onTabChange, onTabClick }: NavigationPanelProps) {
  const { t } = useLanguage()

  const tabs = [
    { id: "mining", label: t.mining, icon: Home },
    { id: "wallet", label: t.wallet, icon: Wallet },
    { id: "tasks", label: t.tasks, icon: CheckSquare },
    { id: "rating", label: t.rating, icon: Trophy },
  ]

  const handleTabClick = (tabId: string) => {
    onTabClick?.()
    onTabChange(tabId)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-green-400/20 font-mono z-40"
      style={{
        paddingBottom: "max(var(--tg-safe-area-inset-bottom, 0px), var(--tg-content-safe-area-inset-bottom, 0px))",
        paddingLeft: "max(var(--tg-safe-area-inset-left, 0px), var(--tg-content-safe-area-inset-left, 0px))",
        paddingRight: "max(var(--tg-safe-area-inset-right, 0px), var(--tg-content-safe-area-inset-right, 0px))",
      }}
    >
      <div className="grid grid-cols-4 h-12">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center justify-center transition-all duration-150 ${
                isActive ? "text-green-400" : "text-green-700/80 hover:text-green-500"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" : ""}`} />
              {isActive && <div className="absolute bottom-1 w-1 h-1 bg-green-400 rounded-full" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
