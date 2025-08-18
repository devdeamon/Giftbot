"use client"

import { Languages } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en")
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-1 bg-green-400/10 border border-green-400/30 rounded text-green-400 hover:bg-green-400/20 transition-colors font-mono text-sm"
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase">{language}</span>
    </button>
  )
}
