"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LiveIndicatorProps {
  isLive?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LiveIndicator({ isLive = true, className, size = "md" }: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setPulse(true)
        setTimeout(() => setPulse(false), 300)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full transition-all duration-300",
            sizeClasses[size],
            isLive ? "bg-green-500" : "bg-gray-500",
            pulse && "scale-110",
          )}
        />
        {isLive && (
          <div
            className={cn("absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75", sizeClasses[size])}
          />
        )}
      </div>
      <span className={cn("text-xs font-medium", isLive ? "text-green-400" : "text-gray-400")}>
        {isLive ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  )
}
