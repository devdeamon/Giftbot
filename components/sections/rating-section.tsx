"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { useLanguage } from "@/contexts/language-context"
import { Trophy, Medal, Crown, TrendingUp, Users, Zap, Star, Award } from "lucide-react"

interface Player {
  rank: number
  name: string
  shards: number
  level: number
  avatar?: string
  isCurrentUser?: boolean
  country?: string
  joinDate?: number
  totalMined?: number
}

interface RatingSectionProps {
  shardsFound: number
  minerLevel: number
  telegramUser?: any
  webApp?: any
}

export function RatingSection({ shardsFound = 0, minerLevel = 1, telegramUser, webApp }: RatingSectionProps) {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<"global" | "level" | "shards" | "country">("global")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  const [userRank, setUserRank] = useState<number>(999)

  useEffect(() => {
    const generateLeaderboard = (): Player[] => {
      const mockPlayers: Player[] = []

      // Calculate user rank based on shards (simplified for real data)
      const calculatedRank = shardsFound > 0 ? Math.max(1, 100 - Math.floor(shardsFound / 10)) : 999

      // Insert current user if they have shards
      if (shardsFound > 0 && telegramUser) {
        const currentUser: Player = {
          rank: calculatedRank,
          name: telegramUser.first_name?.toUpperCase() || t.rating.unknownOperator,
          shards: shardsFound,
          level: minerLevel,
          isCurrentUser: true,
          country: "🌍",
          joinDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
          totalMined: shardsFound,
        }

        setUserRank(calculatedRank)
        return [currentUser]
      }

      setUserRank(calculatedRank)
      return mockPlayers
    }

    setLeaderboard(generateLeaderboard())
  }, [shardsFound, minerLevel, telegramUser, t])

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
    setIsPlayerModalOpen(true)
    webApp?.HapticFeedback?.impactOccurred("light")
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-green-400" />
      case 2:
        return <Medal className="w-5 h-5 text-green-300" />
      case 3:
        return <Medal className="w-5 h-5 text-green-200" />
      default:
        return <span className="text-green-600 font-mono text-sm">#{rank}</span>
    }
  }

  const getRankTitle = (rank: number) => {
    if (rank === 1) return t.rating.supremeMiner
    if (rank <= 3) return t.rating.eliteOperator
    if (rank <= 10) return t.rating.veteranMiner
    if (rank <= 50) return t.rating.skilledOperator
    if (rank <= 100) return t.rating.apprenticeMiner
    return t.rating.rookieOperator
  }

  const getProgressToNextRank = () => {
    const nextRankThreshold = Math.max(1, (100 - userRank + 1) * 10)
    return Math.min(100, (shardsFound / nextRankThreshold) * 100)
  }

  const categories = [
    { id: "global", label: t.rating.global, icon: Trophy },
    { id: "level", label: t.rating.level, icon: TrendingUp },
    { id: "shards", label: t.rating.shards, icon: Star },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border border-green-400/30 p-4 bg-black/50">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-green-600 text-sm">04</span>
          <h1 className="text-2xl font-bold text-green-400 tracking-wider flex items-center justify-center gap-2">
            <Trophy className="text-green-400" />
            {t.rating.title} {">>>>>>>>"}
          </h1>
          <span className="text-green-600 text-sm">04</span>
        </div>
        <p className="text-green-600 text-xs uppercase tracking-widest">{t.rating.leaderboardActive}</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id as any)
                webApp?.HapticFeedback?.selectionChanged()
              }}
              className={`flex items-center gap-2 px-3 py-2 border font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? "bg-green-400/20 text-green-400 border-green-400/30"
                  : "bg-green-400/5 text-green-700 border-green-400/20 hover:bg-green-400/10"
              }`}
            >
              <Icon className="w-3 h-3" />
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Your Position */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Award className="text-green-400" />
            {t.rating.yourPosition}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-400/10 border border-green-400/30">
                {userRank <= 3 ? getRankIcon(userRank) : <Users className="w-6 h-6 text-green-400" />}
              </div>
              <div>
                <div className="text-green-400 font-mono text-lg">#{userRank.toString().padStart(3, "0")}</div>
                <div className="text-green-600 text-xs uppercase">{getRankTitle(userRank)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-mono text-lg">{shardsFound.toLocaleString()}</div>
              <div className="text-green-700 text-xs">{t.rating.shards}</div>
            </div>
          </div>

          {userRank > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">{t.rating.progressToNext}:</span>
                <span className="text-green-400">{getProgressToNextRank().toFixed(1)}%</span>
              </div>
              <div className="text-xs text-green-700 text-center">
                {"█".repeat(Math.floor(getProgressToNextRank() / 5))}
                {"░".repeat(20 - Math.floor(getProgressToNextRank() / 5))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
              {userRank <= 10 ? t.rating.top10Miner : userRank <= 100 ? t.rating.top100Miner : t.rating.activeMiner}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center justify-between text-green-400">
            <div className="flex items-center gap-2">
              <Trophy className="text-green-400" />
              {t.rating.topMiners}
            </div>
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">{t.rating.season01}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {leaderboard.length > 0 ? (
            leaderboard.map((player) => (
              <div
                key={`${player.rank}-${player.name}`}
                onClick={() => handlePlayerClick(player)}
                className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                  player.isCurrentUser
                    ? "border-green-400/50 bg-green-400/10"
                    : "border-green-400/20 bg-green-400/5 hover:bg-green-400/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10">{getRankIcon(player.rank)}</div>
                  <div>
                    <div className={`font-mono text-sm ${player.isCurrentUser ? "text-green-300" : "text-green-400"}`}>
                      {player.name}
                      {player.isCurrentUser && <span className="text-green-600 ml-2">({t.rating.you})</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-700">LVL_{player.level.toString().padStart(2, "0")}</span>
                      {player.country && <span>{player.country}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono ${player.isCurrentUser ? "text-green-300" : "text-green-400"}`}>
                    {player.shards.toLocaleString()}
                  </div>
                  <div className="text-green-700 text-xs">{t.rating.shards}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-green-700 space-y-2">
              <div className="text-6xl">🏆</div>
              <div className="text-xs uppercase tracking-wider">{t.rating.noRankingData}</div>
              <div className="text-xs">
                {">"} {t.rating.startMiningToRank} {"<"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season Info */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Zap className="text-green-400" />
            {t.rating.seasonInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="text-green-400 font-mono text-lg">∞</div>
              <div className="text-green-600 uppercase">{t.rating.daysLeft}</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">{leaderboard.length}</div>
              <div className="text-green-600 uppercase">{t.rating.activeMiners}</div>
            </div>
          </div>

          <div className="space-y-2 border border-green-400/20 p-3">
            <div className="text-xs text-green-600 uppercase text-center">{t.rating.seasonRewards}:</div>
            <div className="space-y-1 text-xs text-green-400">
              <div>
                🥇 {t.rating.rank01}: 10,000 GIFT + {t.rating.legendaryBadge}
              </div>
              <div>
                🥈 {t.rating.rank02}: 5,000 GIFT + {t.rating.epicBadge}
              </div>
              <div>
                🥉 {t.rating.rank03}: 2,500 GIFT + {t.rating.rareBadge}
              </div>
              <div>
                🏆 {t.rating.top100}: 1,000 GIFT + {t.rating.commonBadge}
              </div>
            </div>
          </div>

          <div className="text-xs text-green-700 text-center font-mono border border-green-400/20 p-2">
            {t.rating.competeForRewards}
          </div>
        </CardContent>
      </Card>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <Modal
          isOpen={isPlayerModalOpen}
          onClose={() => setIsPlayerModalOpen(false)}
          title={`${t.rating.operatorProfile}: ${selectedPlayer.name}`}
        >
          <div className="space-y-4 text-green-400">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                {getRankIcon(selectedPlayer.rank)}
              </div>
              <h3 className="text-lg font-mono">{selectedPlayer.name}</h3>
              <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                {getRankTitle(selectedPlayer.rank)}
              </Badge>
            </div>

            <div className="space-y-3 border border-green-400/20 p-3">
              <div className="text-xs text-green-600 uppercase text-center">{t.rating.miningStatistics}:</div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">#{selectedPlayer.rank}</div>
                  <div className="text-green-600">{t.rating.globalRank}</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">{selectedPlayer.shards.toLocaleString()}</div>
                  <div className="text-green-600">{t.rating.shardsFound}</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">
                    LVL_{selectedPlayer.level.toString().padStart(2, "0")}
                  </div>
                  <div className="text-green-600">{t.rating.minerLevel}</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">
                    {selectedPlayer.totalMined?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-green-600">{t.rating.totalMined}</div>
                </div>
              </div>
            </div>

            {selectedPlayer.joinDate && (
              <div className="text-xs text-green-700 text-center">
                {t.rating.joined}: {new Date(selectedPlayer.joinDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
