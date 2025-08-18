"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useLanguage } from "@/contexts/language-context"
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
  claimed: boolean
  icon: string
  difficulty: "easy" | "medium" | "hard"
  expiresAt?: number
}

interface TasksSectionProps {
  shardsFound: number
  minerLevel: number
  miningSessionsCompleted: number
  webApp?: any
  onRewardClaimed?: (reward: number) => void
}

const LS_TASK_KEY = "gift_mining_tasks_state"

const loadTasksState = (): Record<string, { claimed: boolean; claimable: boolean }> => {
  try {
    const raw = localStorage.getItem(LS_TASK_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveTasksState = (state: Record<string, { claimed: boolean; claimable: boolean }>) => {
  try {
    localStorage.setItem(LS_TASK_KEY, JSON.stringify(state))
  } catch {}
}

const syncTaskReward = async (taskId: string, reward: number, telegramInitData?: string) => {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "claimReward",
        taskId,
        reward,
        telegramInitData,
      }),
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Task reward sync failed:", error)
    return null
  }
}

export function TasksSection({
  shardsFound = 0,
  minerLevel = 1,
  miningSessionsCompleted = 0,
  webApp,
  onRewardClaimed,
}: TasksSectionProps) {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "daily" | "achievement" | "social">("all")
  const [isClaimingReward, setIsClaimingReward] = useState<string | null>(null)

  useEffect(() => {
    const savedTasksState = loadTasksState()

    const initialTasks: Task[] = [
      {
        id: "mine_session",
        title: t.tasks.completeMining,
        description: t.tasks.completeMiningDesc,
        type: "mining",
        reward: 25,
        progress: miningSessionsCompleted,
        total: 1,
        completed: miningSessionsCompleted >= 1,
        claimable: miningSessionsCompleted >= 1 && !savedTasksState["mine_session"]?.claimed,
        claimed: savedTasksState["mine_session"]?.claimed || false,
        icon: "⛏",
        difficulty: "easy",
      },
      {
        id: "collect_shards",
        title: t.tasks.shardCollector,
        description: t.tasks.shardCollectorDesc,
        type: "achievement",
        reward: 50,
        progress: Math.min(shardsFound, 10),
        total: 10,
        completed: shardsFound >= 10,
        claimable: shardsFound >= 10 && !savedTasksState["collect_shards"]?.claimed,
        claimed: savedTasksState["collect_shards"]?.claimed || false,
        icon: "💎",
        difficulty: "medium",
      },
      {
        id: "upgrade_miner",
        title: t.tasks.minerUpgrade,
        description: t.tasks.minerUpgradeDesc,
        type: "achievement",
        reward: 100,
        progress: Math.min(minerLevel, 3),
        total: 3,
        completed: minerLevel >= 3,
        claimable: minerLevel >= 3 && !savedTasksState["upgrade_miner"]?.claimed,
        claimed: savedTasksState["upgrade_miner"]?.claimed || false,
        icon: "🔧",
        difficulty: "medium",
      },
      {
        id: "master_miner",
        title: t.tasks.masterMiner,
        description: t.tasks.masterMinerDesc,
        type: "achievement",
        reward: 500,
        progress: Math.min(minerLevel, 10),
        total: 10,
        completed: minerLevel >= 10,
        claimable: minerLevel >= 10 && !savedTasksState["master_miner"]?.claimed,
        claimed: savedTasksState["master_miner"]?.claimed || false,
        icon: "🏆",
        difficulty: "hard",
      },
    ]

    setTasks(initialTasks)
  }, [shardsFound, minerLevel, miningSessionsCompleted, t])

  const handleClaimReward = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.claimable || task.claimed) return

    setIsClaimingReward(taskId)
    webApp?.HapticFeedback?.impactOccurred("medium")

    try {
      // Sync with server
      const result = await syncTaskReward(taskId, task.reward, webApp?.initData)

      if (result?.success) {
        // Update local state
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, claimable: false, claimed: true } : t)))

        // Save to localStorage
        const currentState = loadTasksState()
        const newState = {
          ...currentState,
          [taskId]: { claimed: true, claimable: false },
        }
        saveTasksState(newState)

        // Notify parent component to update balance
        if (onRewardClaimed) {
          onRewardClaimed(task.reward)
        }

        webApp?.HapticFeedback?.notificationOccurred("success")
      } else {
        webApp?.HapticFeedback?.notificationOccurred("error")
      }
    } catch (error) {
      console.error("[v0] Failed to claim reward:", error)
      webApp?.HapticFeedback?.notificationOccurred("error")
    } finally {
      setIsClaimingReward(null)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
    webApp?.HapticFeedback?.impactOccurred("light")
  }

  const filteredTasks = tasks.filter((task) => activeFilter === "all" || task.type === activeFilter)

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalRewards = tasks.filter((task) => task.claimed).reduce((sum, task) => sum + task.reward, 0)
  const claimableRewards = tasks
    .filter((task) => task.claimable && !task.claimed)
    .reduce((sum, task) => sum + task.reward, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 border-green-400/30"
      case "medium":
        return "text-green-300 border-green-300/30"
      case "hard":
        return "text-green-200 border-green-200/30"
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
            {t.tasks.title} {">>>>>>>>"}
          </h1>
          <span className="text-green-600 text-sm">03</span>
        </div>
        <p className="text-green-600 text-xs uppercase tracking-widest">{t.tasks.missionControlActive}</p>
      </div>

      {/* Stats Overview */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Star className="text-green-400" />
            {t.tasks.missionStatistics}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-green-400 font-mono text-lg">{completedTasks.toString().padStart(2, "0")}</div>
              <div className="text-green-600 uppercase">{t.tasks.completed}</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">{totalRewards.toString().padStart(3, "0")}</div>
              <div className="text-green-600 uppercase">{t.tasks.earned}</div>
            </div>
            <div>
              <div className="text-green-400 font-mono text-lg">{claimableRewards.toString().padStart(3, "0")}</div>
              <div className="text-green-600 uppercase">{t.tasks.claimable}</div>
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
          { id: "all", label: t.tasks.all, icon: CheckSquare },
          { id: "achievement", label: t.tasks.achievements, icon: Target },
          { id: "mining", label: t.tasks.mining, icon: Zap },
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
                    {t.tasks.difficulty[task.difficulty]}
                  </Badge>
                  <Badge
                    className={
                      task.claimed
                        ? "bg-green-500/20 text-green-500 border-green-500/30"
                        : task.claimable
                          ? "bg-green-300/20 text-green-300 border-green-300/30"
                          : task.completed
                            ? "bg-green-400/20 text-green-400 border-green-400/30"
                            : "bg-green-700/20 text-green-700 border-green-700/30"
                    }
                  >
                    {task.claimed
                      ? t.tasks.claimed
                      : task.claimable
                        ? t.tasks.claimable
                        : task.completed
                          ? t.tasks.complete
                          : t.tasks.pending}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="text-xs text-green-600">{task.description}</div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-green-700">
                  {t.tasks.progress}: {task.progress}/{task.total}
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <Gift className="w-3 h-3" />
                  <span className="text-sm font-mono">{task.reward}</span>
                  <span className="text-xs">{t.tasks.shards}</span>
                </div>
              </div>

              <div className="text-xs text-green-700 text-center">
                {"█".repeat(Math.floor((task.progress / task.total) * 20))}
                {"░".repeat(20 - Math.floor((task.progress / task.total) * 20))}
              </div>

              <div className="flex gap-2">
                {task.claimed ? (
                  <div className="flex-1 text-center text-xs text-green-500 font-mono py-2 border border-green-500/30">
                    {">"} {t.tasks.rewardClaimed} {"<"}
                  </div>
                ) : task.claimable ? (
                  <Button
                    onClick={() => handleClaimReward(task.id)}
                    disabled={isClaimingReward === task.id}
                    className="flex-1 bg-green-400/20 hover:bg-green-400/30 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider disabled:opacity-50"
                    size="sm"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {isClaimingReward === task.id ? t.tasks.claiming : t.tasks.claimReward}
                  </Button>
                ) : task.completed ? (
                  <div className="flex-1 text-center text-xs text-green-400 font-mono py-2">
                    {">"} {t.tasks.complete} {"<"}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleTaskClick(task)}
                    className="flex-1 bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                    size="sm"
                  >
                    {">"} {t.tasks.viewDetails} {"<"}
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
          title={`${t.tasks.taskDetails}: ${selectedTask.title}`}
        >
          <div className="space-y-4 text-green-400">
            <div className="text-center space-y-2">
              <div className="text-4xl">{selectedTask.icon}</div>
              <h3 className="text-lg font-mono">{selectedTask.title}</h3>
              <Badge className={`${getDifficultyColor(selectedTask.difficulty)} bg-transparent`}>
                {t.tasks.difficulty[selectedTask.difficulty]}
              </Badge>
            </div>

            <div className="space-y-3 border border-green-400/20 p-3">
              <div className="text-xs text-green-600 uppercase">{t.tasks.missionBriefing}:</div>
              <div className="text-sm text-green-400">{selectedTask.description}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">{t.tasks.progress}:</span>
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
              <div className="text-xs text-green-600 uppercase">{t.tasks.rewardPackage}:</div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Gift className="w-5 h-5" />
                <span className="text-xl font-mono">{selectedTask.reward}</span>
                <span className="text-sm">{t.tasks.giftShards}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
