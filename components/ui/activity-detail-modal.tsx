"use client"

import { useState } from "react"
import { X, Copy, ExternalLink, Hash, User, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "block" | "transaction" | "contract"
  title: string
  subtitle: string
  value?: string
  time: string
  status: "success" | "pending" | "failed"
  fullHash?: string
  blockHeight?: number
}

interface ActivityDetailModalProps {
  item: ActivityItem | null
  isOpen: boolean
  onClose: () => void
}

export function ActivityDetailModal({ item, isOpen, onClose }: ActivityDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen || !item) return null

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleViewInExplorer = () => {
    const baseUrl = "https://testnet.monadexplorer.com"
    let explorerUrl = ""

    switch (item.type) {
      case "block":
        explorerUrl = `${baseUrl}/block/${item.blockHeight || item.title.replace("Block #", "")}`
        break
      case "transaction":
        const txHash = item.fullHash || item.title
        explorerUrl = `${baseUrl}/tx/${txHash}`
        break
      case "contract":
        const contractAddress = item.fullHash || item.title
        explorerUrl = `${baseUrl}/address/${contractAddress}`
        break
      default:
        explorerUrl = baseUrl
    }

    window.open(explorerUrl, "_blank", "noopener,noreferrer")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeDetails = () => {
    switch (item.type) {
      case "block":
        return {
          title: "Block Details",
          icon: <Hash className="h-5 w-5" />,
          details: [
            { label: "Block Height", value: item.blockHeight?.toString() || "N/A" },
            { label: "Block Hash", value: item.fullHash || item.title, copyable: true },
            { label: "Transactions", value: item.subtitle.split(" ")[0] },
            { label: "Validator", value: item.value || "Unknown" },
            { label: "Timestamp", value: item.time },
          ],
        }
      case "transaction":
        return {
          title: "Transaction Details",
          icon: <Zap className="h-5 w-5" />,
          details: [
            { label: "Transaction Hash", value: item.fullHash || item.title, copyable: true },
            { label: "From", value: item.subtitle.split(" → ")[0], copyable: true },
            { label: "To", value: item.subtitle.split(" → ")[1], copyable: true },
            { label: "Value", value: item.value || "0 MON" },
            { label: "Gas Used", value: "21,000" },
            { label: "Timestamp", value: item.time },
          ],
        }
      case "contract":
        return {
          title: "Contract Details",
          icon: <User className="h-5 w-5" />,
          details: [
            { label: "Contract Address", value: item.fullHash || item.title, copyable: true },
            { label: "Creator", value: item.subtitle.split(" → ")[0], copyable: true },
            { label: "Creation Value", value: item.value || "0 MON" },
            { label: "Timestamp", value: item.time },
          ],
        }
      default:
        return {
          title: "Details",
          icon: <Hash className="h-5 w-5" />,
          details: [],
        }
    }
  }

  const typeDetails = getTypeDetails()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2a2a3e] rounded-xl flex items-center justify-center text-monad-purple">
              {typeDetails.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{typeDetails.title}</h3>
              <Badge className={cn("rounded-full text-xs", getStatusColor(item.status))}>
                {item.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-[#2a2a3e]">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {typeDetails.details.map((detail, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{detail.label}</p>
                <p className="text-sm text-white font-mono truncate">{detail.value}</p>
              </div>
              {detail.copyable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(detail.value, detail.label)}
                  className="ml-2 h-8 w-8 p-0 hover:bg-[#3a3a4e]"
                >
                  {copiedField === detail.label ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-[#2a2a3e]"
            onClick={handleViewInExplorer}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Explorer
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-[#2a2a3e]"
            onClick={() => handleCopy(item.fullHash || item.title, "full")}
          >
            {copiedField === "full" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
