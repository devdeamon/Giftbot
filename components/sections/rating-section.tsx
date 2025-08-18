"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Trophy, Medal, Crown, TrendingUp, Users, Target, Zap, Star, Award } from "lucide-react"

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
  const [activeCategory, setActiveCategory] = useState<"global" | "level" | "shards" | "country">("global")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  const [userRank, setUserRank] = useState<number>(999)

  useEffect(() => {
    const generateLeaderboard = (): Player[] => {
      const mockPlayers: Player[] = [
        {
          rank: 1,
          name: "OPERATOR_ALPHA",
          shards: 15420,
          level: 12,
          country: "🇺🇸",
          joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          totalMined: 20000,
        },
        {
          rank: 2,
          name: "MINER_BETA",
          shards: 12350,
          level: 10,
          country: "🇩🇪",
          joinDate: Date.now() - 25 * 24 * 60 * 60 * 1000,
          totalMined: 15000,
        },
        {
          rank: 3,
          name: "CRYPTO_GAMMA",
          shards: 9870,
          level: 9,
          country: "🇯🇵",
          joinDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
          totalMined: 12000,
        },
        {
          rank: 4,
          name: "DIGITAL_DELTA",
          shards: 7650,
          level: 8,
          country: "🇬🇧",
          joinDate: Date.now() - 18 * 24 * 60 * 60 * 1000,
          totalMined: 9500,
        },
        {
          rank: 5,
          name: "QUANTUM_ECHO",
          shards: 6420,
          level: 7,
          country: "🇫🇷",
          joinDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
          totalMined: 8000,
        },
        {
          rank: 6,
          name: "CYBER_FOXTROT",
          shards: 5200,
          level: 6,
          country: "🇨🇦",
          joinDate: Date.now() - 12 * 24 * 60 * 60 * 1000,
          totalMined: 6500,
        },
        {
          rank: 7,
          name: "MATRIX_GOLF",
          shards: 4100,
          level: 5,
          country: "🇦🇺",
          joinDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
          totalMined: 5200,
        },
        {
          rank: 8,
          name: "NEURAL_HOTEL",
          shards: 3300,
          level: 4,
          country: "🇰🇷",
          joinDate: Date.now() - 8 * 24 * 60 * 60 * 1000,
          totalMined: 4100,
        },
      ]

      // Calculate user rank based on shards
      let calculatedRank = mockPlayers.length + 1
      for (let i = 0; i < mockPlayers.length; i++) {
        if (shardsFound > mockPlayers[i].shards) {
          calculatedRank = i + 1
          break
        }
      }

      // Insert current user if they have a good rank
      if (calculatedRank <= 10 && telegramUser) {
        const currentUser: Player = {
          rank: calculatedRank,
          name: telegramUser.first_name?.toUpperCase() || "UNKNOWN_OPERATOR",
          shards: shardsFound,
          level: minerLevel,
          isCurrentUser: true,
          country: "🌍",
          joinDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
          totalMined: shardsFound * 1.2,
        }

        // Adjust ranks of other players
        const adjustedPlayers = mockPlayers.map((player) => ({
          ...player,
          rank: player.rank >= calculatedRank ? player.rank + 1 : player.rank,
        }))

        adjustedPlayers.splice(calculatedRank - 1, 0, currentUser)
        setUserRank(calculatedRank)
        return adjustedPlayers.slice(0, 10)
      }

      setUserRank(calculatedRank)
      return mockPlayers
    }

    setLeaderboard(generateLeaderboard())
  }, [shardsFound, minerLevel, telegramUser])

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player)
    setIsPlayerModalOpen(true)
    webApp?.HapticFeedback?.impactOccurred("light")
  }

  const handleChallengePlayer = (player: Player) => {
    webApp?.HapticFeedback?.notificationOccurred("success")
    // TODO: Implement challenge system
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />
      default:
        return <span className="text-green-600 font-mono text-sm">#{rank}</span>
    }
  }

  const getRankTitle = (rank: number) => {
    if (rank === 1) return "SUPREME_MINER"
    if (rank <= 3) return "ELITE_OPERATOR"
    if (rank <= 10) return "VETERAN_MINER"
    if (rank <= 50) return "SKILLED_OPERATOR"
    if (rank <= 100) return "APPRENTICE_MINER"
    return "ROOKIE_OPERATOR"
  }

  const getProgressToNextRank = () => {
    const nextRankThreshold = leaderboard.find((p) => p.rank === userRank - 1)?.shards || 0
    if (nextRankThreshold === 0) return 100
    return Math.min(100, (shardsFound / nextRankThreshold) * 100)
  }

  const categories = [
    { id: "global", label: "GLOBAL", icon: Trophy },
    { id: "level", label: "LEVEL", icon: TrendingUp },
    { id: "shards", label: "SHARDS", icon: Star },
    { id: "country", label: "REGION", icon: Target },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border border-green-400/30 p-4 bg-black/50">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-green-600 text-sm">04</span>
          <h1 className="text-2xl font-bold text-green-400 tracking-wider flex items-center justify-center gap-2">
            <Trophy className="text-green-400" />
            GLOBAL RATING {">>>>>>>>"}
          </h1>
          <span className="text-green-600 text-sm">04</span>
        </div>
        <p className="text-green-600 text-xs uppercase tracking-widest">LEADERBOARD PROTOCOL ACTIVE</p>
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
            YOUR_POSITION
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
              <div className="text-green-700 text-xs">SHARDS</div>
            </div>
          </div>

          {userRank > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">PROGRESS_TO_NEXT_RANK:</span>
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
              {userRank <= 10 ? "TOP_10_MINER" : userRank <= 100 ? "TOP_100_MINER" : "ACTIVE_MINER"}
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
              TOP_MINERS
            </div>
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">SEASON_01</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {leaderboard.map((player) => (
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
                    {player.isCurrentUser && <span className="text-green-600 ml-2">(YOU)</span>}
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
                <div className="text-green-700 text-xs">SHARDS</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Season Info */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Zap className="text-green-400" />
            SEASON_INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="text-green-400 font-mono text-lg">45</div>
              <div className="text-green-600 uppercase">DAYS_LEFT</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">1,247</div>
              <div className="text-green-600 uppercase">ACTIVE_MINERS</div>
            </div>
          </div>

          <div className="space-y-2 border border-green-400/20 p-3">
            <div className="text-xs text-green-600 uppercase text-center">SEASON_REWARDS:</div>
            <div className="space-y-1 text-xs text-green-400">
              <div>🥇 RANK_01: 10,000_GIFT + LEGENDARY_BADGE</div>
              <div>🥈 RANK_02-03: 5,000_GIFT + EPIC_BADGE</div>
              <div>🥉 RANK_04-10: 2,500_GIFT + RARE_BADGE</div>
              <div>🏆 TOP_100: 1,000_GIFT + COMMON_BADGE</div>
            </div>
          </div>

          <div className="text-xs text-green-700 text-center font-mono border border-green-400/20 p-2">
            COMPETE_FOR_EXCLUSIVE_SEASON_REWARDS
          </div>
        </CardContent>
      </Card>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <Modal
          isOpen={isPlayerModalOpen}
          onClose={() => setIsPlayerModalOpen(false)}
          title={`OPERATOR_PROFILE: ${selectedPlayer.name}`}
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
              <div className="text-xs text-green-600 uppercase text-center">MINING_STATISTICS:</div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">#{selectedPlayer.rank}</div>
                  <div className="text-green-600">GLOBAL_RANK</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">{selectedPlayer.shards.toLocaleString()}</div>
                  <div className="text-green-600">SHARDS_FOUND</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">
                    LVL_{selectedPlayer.level.toString().padStart(2, "0")}
                  </div>
                  <div className="text-green-600">MINER_LEVEL</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-mono text-lg">
                    {selectedPlayer.totalMined?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-green-600">TOTAL_MINED</div>
                </div>
              </div>
            </div>

            {selectedPlayer.joinDate && (
              <div className="text-xs text-green-700 text-center">
                JOINED: {new Date(selectedPlayer.joinDate).toLocaleDateString()}
              </div>
            )}

            {!selectedPlayer.isCurrentUser && (
              <div className="space-y-2">
                <Button
                  onClick={() => handleChallengePlayer(selectedPlayer)}
                  className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  CHALLENGE_OPERATOR
                </Button>
                <div className="text-xs text-green-700 text-center font-mono">COMING_SOON: DIRECT_COMPETITION</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
