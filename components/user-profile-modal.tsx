"use client"

import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { User, Crown, Calendar, Globe, Hash } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface TelegramUser {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  is_premium?: boolean
  language_code?: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: TelegramUser | null
  webApp: any
}

export function UserProfileModal({ isOpen, onClose, user, webApp }: UserProfileModalProps) {
  const { t } = useLanguage()

  if (!user) return null

  const joinDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.userProfile}>
      <div className="space-y-4 text-green-400">
        {/* User Avatar/Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-green-400/10 border border-green-400/30 flex items-center justify-center">
            {user.photo_url ? (
              <img src={user.photo_url || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-green-400" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-green-400 font-mono">
              {user.first_name} {user.last_name || ""}
            </h3>
            {user.username && <p className="text-sm text-green-600">@{user.username}</p>}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
            <User className="w-3 h-3 mr-1" />
            {t.operator}
          </Badge>
          {user.is_premium && (
            <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
              <Crown className="w-3 h-3 mr-1" />
              {t.premium}
            </Badge>
          )}
        </div>

        {/* User Details */}
        <div className="space-y-3 border border-green-400/20 p-3">
          <div className="text-xs text-green-600 uppercase tracking-wider text-center">{t.systemInfo}</div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
              <span className="text-green-600 uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" />
                USER_ID:
              </span>
              <span className="text-green-400 font-mono">{user.id}</span>
            </div>

            <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
              <span className="text-green-600 uppercase flex items-center gap-1">
                <Globe className="w-3 h-3" />
                LANGUAGE:
              </span>
              <span className="text-green-400 font-mono">{user.language_code?.toUpperCase() || "EN"}</span>
            </div>

            <div className="flex justify-between items-center border-b border-green-400/10 pb-1">
              <span className="text-green-600 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t.joinDate}:
              </span>
              <span className="text-green-400 font-mono">{joinDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-green-600 uppercase">{t.platform}:</span>
              <span className="text-green-400 font-mono">{webApp?.platform?.toUpperCase() || "WEB"}</span>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-2 border border-green-400/20 p-3">
          <div className="text-xs text-green-600 uppercase tracking-wider text-center">{t.accountType}</div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-mono text-green-400">{user.is_premium ? t.premium : t.standard}</div>

            {user.is_premium ? (
              <div className="text-xs text-yellow-400 space-y-1">
                <div>✓ ENHANCED_MINING_SPEED</div>
                <div>✓ PRIORITY_SUPPORT</div>
                <div>✓ EXCLUSIVE_FEATURES</div>
              </div>
            ) : (
              <div className="text-xs text-green-700 space-y-1">
                <div>• STANDARD_MINING_SPEED</div>
                <div>• BASIC_FEATURES</div>
                <div className="text-green-600">UPGRADE_TO_PREMIUM_FOR_MORE</div>
              </div>
            )}
          </div>
        </div>

        {/* ASCII Art */}
        <div className="text-center text-xs text-green-800 font-mono">
          <div className="border border-green-400/10 p-2">
            {">"} OPERATOR_AUTHENTICATED {"<"}
            <br />
            {"█".repeat(20)}
            <br />
            SECURITY_LEVEL: MAXIMUM
          </div>
        </div>
      </div>
    </Modal>
  )
}
