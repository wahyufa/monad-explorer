"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Activity, Blocks, ArrowUpRight, ArrowDownRight, ExternalLink, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PulseDot } from "./pulse-dot"
import { Button } from "@/components/ui/button"

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

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
  maxItems?: number
  onItemClick?: (item: ActivityItem) => void
}

export function ActivityFeed({ items, className, maxItems = 5, onItemClick }: ActivityFeedProps) {
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Memoize the display items to prevent unnecessary re-renders
  const displayItems = useMemo(() => {
    return items.slice(0, maxItems)
  }, [items, maxItems])

  // Memoize current item IDs to prevent dependency changes
  const currentItemIds = useMemo(() => {
    return new Set(displayItems.map((item) => item.id))
  }, [displayItems])

  // Use a ref to track previous items to avoid infinite loops
  const [previousItemIds, setPreviousItemIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Only update if the item IDs have actually changed
    const currentIds = Array.from(currentItemIds).sort().join(",")
    const previousIds = Array.from(previousItemIds).sort().join(",")

    if (currentIds !== previousIds) {
      // Find truly new items (not just reordered)
      const newIds = new Set(Array.from(currentItemIds).filter((id) => !previousItemIds.has(id)))

      if (newIds.size > 0) {
        setNewItemIds(newIds)
        // Clear the "new" status after animation
        const timer = setTimeout(() => {
          setNewItemIds(new Set())
        }, 2000)

        // Cleanup timer
        return () => clearTimeout(timer)
      }

      // Update previous items for next comparison
      setPreviousItemIds(new Set(currentItemIds))
    }
  }, [currentItemIds, previousItemIds])

  const handleCopyHash = async (item: ActivityItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const hashToCopy = item.fullHash || item.title

    try {
      await navigator.clipboard.writeText(hashToCopy)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy hash:", err)
    }
  }

  const handleExplorerClick = (item: ActivityItem, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handleItemClick = (item: ActivityItem) => {
    if (onItemClick) {
      onItemClick(item)
    } else {
      // Default behavior - open in explorer
      handleExplorerClick(item, {} as React.MouseEvent)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "block":
        return <Blocks className="h-4 w-4" />
      case "transaction":
        return <Activity className="h-4 w-4" />
      case "contract":
        return <ArrowUpRight className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "block":
        return "text-monad-purple"
      case "transaction":
        return "text-green-400"
      case "contract":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDisplayText = (text: string, type: string) => {
    if (type === "transaction" && text.length > 20) {
      // For transaction hashes, show first 10 and last 6 characters
      return `${text.slice(0, 10)}...${text.slice(-6)}`
    }
    if (type === "block") {
      return text // Don't truncate block titles
    }
    if (text.length > 30) {
      return `${text.slice(0, 30)}...`
    }
    return text
  }

  const formatSubtitle = (subtitle: string) => {
    // For addresses in subtitle (from → to), truncate each address
    if (subtitle.includes(" → ")) {
      const [from, to] = subtitle.split(" → ")
      const formatAddr = (addr: string) => {
        if (addr.length > 10) {
          return `${addr.slice(0, 6)}...${addr.slice(-4)}`
        }
        return addr
      }
      return `${formatAddr(from)} → ${formatAddr(to)}`
    }
    return subtitle
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayItems.map((item, index) => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer group",
            "hover:bg-[#2a2a3e]/70 hover:scale-[1.02] hover:shadow-md",
            newItemIds.has(item.id) && "bg-monad-purple/10 border border-monad-purple/20 animate-pulse",
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="relative">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-[#2a2a3e] transition-all duration-200",
                "group-hover:bg-[#3a3a4e] group-hover:scale-110",
                getIconColor(item.type),
              )}
            >
              {getIcon(item.type)}
            </div>
            {newItemIds.has(item.id) && (
              <div className="absolute -top-1 -right-1">
                <PulseDot color="purple" size="sm" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white font-mono group-hover:text-monad-purple transition-colors duration-200">
                {formatDisplayText(item.title, item.type)}
              </p>
              {item.value && (
                <span className="text-sm font-medium text-gray-300 ml-2 group-hover:text-white transition-colors duration-200">
                  {item.value}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-mono group-hover:text-gray-300 transition-colors duration-200">
                {formatSubtitle(item.subtitle)}
              </p>
              <span className="text-xs text-gray-500 ml-2 group-hover:text-gray-400 transition-colors duration-200">
                {item.time}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Hash Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleCopyHash(item, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 hover:bg-[#3a3a4e]"
            >
              {copiedId === item.id ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400" />
              )}
            </Button>

            {/* External Link Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleExplorerClick(item, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 hover:bg-[#3a3a4e]"
            >
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </Button>

            {/* Status Indicator */}
            {item.status === "success" && <ArrowUpRight className="h-3 w-3 text-green-400" />}
            {item.status === "pending" && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
            {item.status === "failed" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
          </div>
        </div>
      ))}
    </div>
  )
}
