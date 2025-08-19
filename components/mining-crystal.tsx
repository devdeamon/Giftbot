"use client"

import { Gem } from "lucide-react"

interface MiningCrystalProps {
  isActive: boolean
  size?: "sm" | "md" | "lg"
  color?: "primary" | "accent" | "secondary"
}

export function MiningCrystal({ isActive, size = "md", color = "primary" }: MiningCrystalProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    secondary: "text-secondary",
  }

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${isActive ? "pulse-glow" : ""}`}>
      <Gem className="w-full h-full" />
    </div>
  )
}
