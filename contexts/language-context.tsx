"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, type Translations } from "@/lib/i18n"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("gift-mining-language")
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang)
      localStorage.setItem("gift-mining-language", lang)
    }
  }

  const t = translations[language] || translations.en

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
