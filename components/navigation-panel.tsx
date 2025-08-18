"use client"

import { Home, Wallet, CheckSquare, Trophy } from "lucide-react"

interface NavigationPanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onTabClick?: () => void
}

export function NavigationPanel({ activeTab, onTabChange, onTabClick }: NavigationPanelProps) {
  const tabs = [
    { id: "mining", label: "MINING", icon: Home },
    { id: "wallet", label: "WALLET", icon: Wallet },
    { id: "tasks", label: "TASKS", icon: CheckSquare },
    { id: "rating", label: "RATING", icon: Trophy },
  ]

  const handleTabClick = (tabId: string) => {
    onTabClick?.()
    onTabChange(tabId)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-400/30 font-mono z-40"
      style={{
        paddingBottom: "max(var(--tg-safe-area-inset-bottom, 0px), var(--tg-content-safe-area-inset-bottom, 0px))",
        paddingLeft: "max(var(--tg-safe-area-inset-left, 0px), var(--tg-content-safe-area-inset-left, 0px))",
        paddingRight: "max(var(--tg-safe-area-inset-right, 0px), var(--tg-content-safe-area-inset-right, 0px))",
      }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                isActive ? "text-green-400 bg-green-400/10" : "text-green-700 hover:text-green-500 hover:bg-green-400/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
              <span className="text-xs uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-green-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* ASCII decoration */}
      <div className="text-center text-xs text-green-800 py-1">
        {">"} NAVIGATION_PROTOCOL {"<"}
      </div>
    </div>
  )
}
