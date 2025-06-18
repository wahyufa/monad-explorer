"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "success" | "pending" | "failed" | "active" | "inactive"
  children: React.ReactNode
  animate?: boolean
  className?: string
}

export function StatusBadge({ status, children, animate = true, className }: StatusBadgeProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (animate && (status === "active" || status === "success")) {
      const interval = setInterval(() => {
        setPulse(true)
        setTimeout(() => setPulse(false), 200)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [animate, status])

  const statusStyles = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    active: "bg-monad-purple/20 text-monad-purple border-monad-purple/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }

  return (
    <Badge
      className={cn(
        "rounded-full transition-all duration-300",
        statusStyles[status],
        pulse && "scale-105 shadow-lg",
        className,
      )}
    >
      {children}
    </Badge>
  )
}
