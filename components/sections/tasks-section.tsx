"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { CheckSquare, Gift, Zap, Users, Calendar, Target, Star } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  type: "daily" | "achievement" | "social" | "mining"
  reward: number
  progress: number
  total: number
  completed: boolean
  claimable: boolean
  icon: string
  difficulty: "easy" | "medium" | "hard"
  expiresAt?: number
}

interface TasksSectionProps {
  shardsFound: number
  minerLevel: number
  miningSessionsCompleted: number
  webApp?: any
}

export function TasksSection({
  shardsFound = 0,
  minerLevel = 1,
  miningSessionsCompleted = 0,
  webApp,
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "daily" | "achievement" | "social">("all")

  useEffect(() => {
    const initialTasks: Task[] = [
      {
        id: "daily_login",
        title: "DAILY_LOGIN",
        description: "Login to the mining protocol daily",
        type: "daily",
        reward: 10,
        progress: 1,
        total: 1,
        completed: true,
        claimable: false,
        icon: "📅",
        difficulty: "easy",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      },
      {
        id: "mine_session",
        title: "COMPLETE_MINING",
        description: "Complete one full mining session",
        type: "mining",
        reward: 25,
        progress: miningSessionsCompleted,
        total: 1,
        completed: miningSessionsCompleted >= 1,
        claimable: miningSessionsCompleted >= 1,
        icon: "⛏",
        difficulty: "easy",
      },
      {
        id: "collect_shards",
        title: "SHARD_COLLECTOR",
        description: "Collect your first 10 GIFT shards",
        type: "achievement",
        reward: 50,
        progress: Math.min(shardsFound, 10),
        total: 10,
        completed: shardsFound >= 10,
        claimable: shardsFound >= 10,
        icon: "💎",
        difficulty: "medium",
      },
      {
        id: "upgrade_miner",
        title: "MINER_UPGRADE",
        description: "Upgrade your miner to level 3",
        type: "achievement",
        reward: 100,
        progress: Math.min(minerLevel, 3),
        total: 3,
        completed: minerLevel >= 3,
        claimable: minerLevel >= 3,
        icon: "🔧",
        difficulty: "medium",
      },
      {
        id: "invite_friends",
        title: "RECRUIT_OPERATORS",
        description: "Invite 3 operators to join mining",
        type: "social",
        reward: 200,
        progress: 0,
        total: 3,
        completed: false,
        claimable: false,
        icon: "👥",
        difficulty: "hard",
      },
      {
        id: "master_miner",
        title: "MASTER_MINER",
        description: "Reach miner level 10",
        type: "achievement",
        reward: 500,
        progress: Math.min(minerLevel, 10),
        total: 10,
        completed: minerLevel >= 10,
        claimable: minerLevel >= 10,
        icon: "🏆",
        difficulty: "hard",
      },
    ]

    setTasks(initialTasks)
  }, [shardsFound, minerLevel, miningSessionsCompleted])

  const handleClaimReward = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, claimable: false } : task)))
    webApp?.HapticFeedback?.notificationOccurred("success")
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
    webApp?.HapticFeedback?.impactOccurred("light")
  }

  const handleShareTask = (task: Task) => {
    const shareText = `🎮 Join me in GIFT Shard Mining! Complete "${task.title}" and earn ${task.reward} shards! 💎`

    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareText)}`)
    }
    webApp?.HapticFeedback?.selectionChanged()
  }

  const filteredTasks = tasks.filter((task) => activeFilter === "all" || task.type === activeFilter)

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalRewards = tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.reward, 0)
  const claimableRewards = tasks.filter((task) => task.claimable).reduce((sum, task) => sum + task.reward, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 border-green-400/30"
      case "medium":
        return "text-yellow-400 border-yellow-400/30"
      case "hard":
        return "text-red-400 border-red-400/30"
      default:
        return "text-green-400 border-green-400/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Calendar className="w-4 h-4" />
      case "achievement":
        return <Target className="w-4 h-4" />
      case "social":
        return <Users className="w-4 h-4" />
      case "mining":
        return <Zap className="w-4 h-4" />
      default:
        return <CheckSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border border-green-400/30 p-4 bg-black/50">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-green-600 text-sm">03</span>
          <h1 className="text-2xl font-bold text-green-400 tracking-wider flex items-center justify-center gap-2">
            <CheckSquare className="text-green-400" />
            TASK PROTOCOL {">>>>>>>>"}
          </h1>
          <span className="text-green-600 text-sm">03</span>
        </div>
        <p className="text-green-600 text-xs uppercase tracking-widest">MISSION CONTROL ACTIVE</p>
      </div>

      {/* Stats Overview */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Star className="text-green-400" />
            MISSION_STATISTICS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-green-400 font-mono text-lg">{completedTasks.toString().padStart(2, "0")}</div>
              <div className="text-green-600 uppercase">COMPLETED</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">{totalRewards.toString().padStart(3, "0")}</div>
              <div className="text-green-600 uppercase">EARNED</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">{claimableRewards.toString().padStart(3, "0")}</div>
              <div className="text-green-600 uppercase">CLAIMABLE</div>
            </div>
          </div>
          <div className="text-xs text-green-700 text-center">
            {"█".repeat(Math.min(20, completedTasks * 2))}
            {"░".repeat(Math.max(0, 20 - completedTasks * 2))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "ALL", icon: CheckSquare },
          { id: "daily", label: "DAILY", icon: Calendar },
          { id: "achievement", label: "ACHIEVE", icon: Target },
          { id: "social", label: "SOCIAL", icon: Users },
        ].map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id as any)
                webApp?.HapticFeedback?.selectionChanged()
              }}
              className={`flex items-center gap-2 px-3 py-2 border font-mono text-xs uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-green-400/20 text-green-400 border-green-400/30"
                  : "bg-green-400/5 text-green-700 border-green-400/20 hover:bg-green-400/10"
              }`}
            >
              <Icon className="w-3 h-3" />
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-black border-green-400/30 border">
            <CardHeader className="border-b border-green-400/20">
              <CardTitle className="flex items-center justify-between text-green-400">
                <div className="flex items-center gap-2">
                  {getTypeIcon(task.type)}
                  <span className="text-sm">{task.title}</span>
                  <span className="text-lg">{task.icon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getDifficultyColor(task.difficulty)} bg-transparent`}>
                    {task.difficulty.toUpperCase()}
                  </Badge>
                  <Badge
                    className={
                      task.completed
                        ? "bg-green-400/20 text-green-400 border-green-400/30"
                        : task.claimable
                          ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
                          : "bg-green-700/20 text-green-700 border-green-700/30"
                    }
                  >
                    {task.completed ? "COMPLETE" : task.claimable ? "CLAIMABLE" : "PENDING"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="text-xs text-green-600">{task.description}</div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-green-700">
                  PROGRESS: {task.progress}/{task.total}
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <Gift className="w-3 h-3" />
                  <span className="text-sm font-mono">{task.reward}</span>
                  <span className="text-xs">SHARDS</span>
                </div>
              </div>

              <div className="text-xs text-green-700 text-center">
                {"█".repeat(Math.floor((task.progress / task.total) * 20))}
                {"░".repeat(20 - Math.floor((task.progress / task.total) * 20))}
              </div>

              {task.expiresAt && (
                <div className="text-xs text-green-700 text-center">
                  EXPIRES: {new Date(task.expiresAt).toLocaleTimeString()}
                </div>
              )}

              <div className="flex gap-2">
                {task.claimable ? (
                  <Button
                    onClick={() => handleClaimReward(task.id)}
                    className="flex-1 bg-green-400/20 hover:bg-green-400/30 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                    size="sm"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    CLAIM_REWARD
                  </Button>
                ) : task.completed ? (
                  <div className="flex-1 text-center text-xs text-green-400 font-mono py-2">
                    {">"} REWARD_CLAIMED {"<"}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleTaskClick(task)}
                    className="flex-1 bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                    size="sm"
                  >
                    {">"} VIEW_DETAILS {"<"}
                  </Button>
                )}

                {task.type === "social" && (
                  <Button
                    onClick={() => handleShareTask(task)}
                    className="bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                    size="sm"
                  >
                    SHARE
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title={`TASK_DETAILS: ${selectedTask.title}`}
        >
          <div className="space-y-4 text-green-400">
            <div className="text-center space-y-2">
              <div className="text-4xl">{selectedTask.icon}</div>
              <h3 className="text-lg font-mono">{selectedTask.title}</h3>
              <Badge className={`${getDifficultyColor(selectedTask.difficulty)} bg-transparent`}>
                {selectedTask.difficulty.toUpperCase()}_DIFFICULTY
              </Badge>
            </div>

            <div className="space-y-3 border border-green-400/20 p-3">
              <div className="text-xs text-green-600 uppercase">MISSION_BRIEFING:</div>
              <div className="text-sm text-green-400">{selectedTask.description}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">PROGRESS:</span>
                <span className="text-green-400 font-mono">
                  {selectedTask.progress}/{selectedTask.total}
                </span>
              </div>
              <div className="text-xs text-green-700 text-center">
                {"█".repeat(Math.floor((selectedTask.progress / selectedTask.total) * 30))}
                {"░".repeat(30 - Math.floor((selectedTask.progress / selectedTask.total) * 30))}
              </div>
            </div>

            <div className="space-y-2 border border-green-400/20 p-3">
              <div className="text-xs text-green-600 uppercase">REWARD_PACKAGE:</div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Gift className="w-5 h-5" />
                <span className="text-xl font-mono">{selectedTask.reward}</span>
                <span className="text-sm">GIFT_SHARDS</span>
              </div>
            </div>

            {selectedTask.type === "social" && (
              <div className="text-xs text-green-700 text-center font-mono border border-green-400/20 p-2">
                SHARE_WITH_FRIENDS_TO_COMPLETE
              </div>
            )}

            {selectedTask.expiresAt && (
              <div className="text-xs text-red-400 text-center font-mono border border-red-400/20 p-2">
                ⚠ EXPIRES: {new Date(selectedTask.expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
