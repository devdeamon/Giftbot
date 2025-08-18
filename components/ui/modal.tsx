"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = "hidden"
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      document.body.style.overflow = "auto"
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className={`bg-black border border-green-400/50 max-w-md w-full max-h-[80vh] overflow-y-auto font-mono transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-400/30">
          <h2 className="text-green-400 font-bold uppercase tracking-wider text-sm">{title}</h2>
          <button onClick={onClose} className="text-green-600 hover:text-green-400 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        <div className="border-t border-green-400/20 p-2">
          <div className="text-center text-xs text-green-700">
            {">"} ESC_TO_CLOSE {"<"}
          </div>
        </div>
      </div>
    </div>
  )
}
