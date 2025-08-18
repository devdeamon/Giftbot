"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useLanguage } from "@/contexts/language-context"
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  QrCode,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"

interface WalletSectionProps {
  shardsFound: number
  webApp?: any
}

interface Transaction {
  id: string
  type: "mining" | "send" | "receive"
  amount: number
  timestamp: number
  status: "completed" | "pending" | "failed"
  description: string
}

export function WalletSection({ shardsFound = 0, webApp }: WalletSectionProps) {
  const { t } = useLanguage()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")

  const giftBalance = shardsFound * 0.001

  const transactions: Transaction[] =
    shardsFound > 0
      ? [
          {
            id: "mining_001",
            type: "mining" as const,
            amount: giftBalance,
            timestamp: Date.now() - 3600000,
            status: "completed" as const,
            description: t.wallet.miningRewards,
          },
        ]
      : []

  const handleSendTokens = () => {
    if (!sendAmount || !sendAddress) {
      webApp?.HapticFeedback?.notificationOccurred("error")
      return
    }

    webApp?.HapticFeedback?.notificationOccurred("success")
    setIsSendModalOpen(false)
    setSendAmount("")
    setSendAddress("")
  }

  const handleCopyAddress = () => {
    const address = "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e"
    navigator.clipboard?.writeText(address)
    webApp?.HapticFeedback?.selectionChanged()
  }

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible)
    webApp?.HapticFeedback?.impactOccurred("light")
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString("ru-RU", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border border-green-400/30 p-4 bg-black/50">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-green-600 text-sm">02</span>
          <h1 className="text-2xl font-bold text-green-400 tracking-wider flex items-center justify-center gap-2">
            <Wallet className="text-green-400" />
            {t.wallet.title} {">>>>>>>>"}
          </h1>
          <span className="text-green-600 text-sm">02</span>
        </div>
        <p className="text-green-600 text-xs uppercase tracking-widest">{t.wallet.protocolActive}</p>
      </div>

      {/* Balance */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center justify-between text-green-400">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-400" />
              {t.wallet.accountBalance}
            </div>
            <button onClick={toggleBalanceVisibility} className="text-green-600 hover:text-green-400">
              {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="text-center space-y-2">
            <div className="text-4xl font-mono text-green-400 tracking-wider">
              {isBalanceVisible ? giftBalance.toFixed(6) : "••••••"}
            </div>
            <div className="text-xs text-green-600 uppercase tracking-wider">{t.wallet.giftTokens}</div>
            <div className="text-xs text-green-700">{"$".repeat(Math.min(20, Math.floor(giftBalance * 1000)))}</div>
          </div>
          <div className="flex justify-center">
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
              {giftBalance > 0 ? t.wallet.walletActive : t.wallet.walletEmpty}
            </Badge>
          </div>
          <div className="text-xs text-green-700 text-center font-mono">
            {t.wallet.shardsConverted}: {shardsFound.toString().padStart(6, "0")}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-black border-green-400/30 border">
          <CardContent className="p-4">
            <Button
              onClick={() => {
                webApp?.HapticFeedback?.selectionChanged()
                setIsSendModalOpen(true)
              }}
              className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
              disabled={giftBalance <= 0}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              {t.wallet.sendTokens}
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-black border-green-400/30 border">
          <CardContent className="p-4">
            <Button
              onClick={() => {
                webApp?.HapticFeedback?.selectionChanged()
                setIsReceiveModalOpen(true)
              }}
              className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              {t.wallet.receiveTokens}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="bg-black border-green-400/30 border">
        <CardHeader className="border-b border-green-400/20">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <TrendingUp className="text-green-400" />
            {t.wallet.transactionHistory}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 border border-green-400/20 bg-green-400/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400/10 border border-green-400/30">
                      {tx.type === "mining" && "⛏"}
                      {tx.type === "send" && <ArrowUpRight className="w-4 h-4 text-green-400" />}
                      {tx.type === "receive" && <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                    </div>
                    <div>
                      <div className="text-green-400 font-mono text-sm">{tx.description}</div>
                      <div className="text-green-700 text-xs">{formatTime(tx.timestamp)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono ${tx.type === "send" ? "text-red-400" : "text-green-400"}`}>
                      {tx.type === "send" ? "-" : "+"}
                      {tx.amount.toFixed(6)}
                    </div>
                    <div className="text-green-700 text-xs uppercase">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-green-700 space-y-2">
              <div className="text-6xl">💳</div>
              <div className="text-xs uppercase tracking-wider">{t.wallet.noTransactions}</div>
              <div className="text-xs">
                {">"} {t.wallet.startMiningToEarn} {"<"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Modal */}
      <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title={t.wallet.sendTokens}>
        <div className="space-y-4 text-green-400">
          <div className="space-y-2">
            <label className="text-xs text-green-600 uppercase">{t.wallet.recipientAddress}:</label>
            <input
              type="text"
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e"
              className="w-full bg-black border border-green-400/30 text-green-400 p-2 text-xs font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-green-600 uppercase">{t.wallet.amount}:</label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.000000"
              max={giftBalance}
              step="0.000001"
              className="w-full bg-black border border-green-400/30 text-green-400 p-2 text-xs font-mono"
            />
            <div className="text-xs text-green-700">
              {t.wallet.available}: {giftBalance.toFixed(6)} GIFT
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleSendTokens}
              disabled={!sendAmount || !sendAddress || Number.parseFloat(sendAmount) > giftBalance}
              className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.wallet.executeTransfer}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receive Modal */}
      <Modal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} title={t.wallet.receiveTokens}>
        <div className="space-y-4 text-green-400">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-green-400/10 border border-green-400/30 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-green-600 uppercase">{t.wallet.yourWalletAddress}:</div>
              <div className="bg-black border border-green-400/30 p-2 text-xs font-mono break-all">
                0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e
              </div>
              <Button
                onClick={handleCopyAddress}
                className="w-full bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 font-mono uppercase tracking-wider"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                {t.wallet.copyAddress}
              </Button>
            </div>
          </div>
          <div className="text-xs text-green-700 text-center font-mono border border-green-400/20 p-2">
            {t.wallet.shareAddress}
          </div>
        </div>
      </Modal>
    </div>
  )
}
