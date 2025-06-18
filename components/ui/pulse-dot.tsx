"use client"

import { cn } from "@/lib/utils"

interface PulseDotProps {
  color?: "green" | "blue" | "purple" | "orange" | "red"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PulseDot({ color = "green", size = "md", className }: PulseDotProps) {
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-monad-purple",
    orange: "bg-orange-500",
    red: "bg-red-500",
  }

  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("rounded-full", colorClasses[color], sizeClasses[size])} />
      <div
        className={cn("absolute inset-0 rounded-full animate-ping opacity-75", colorClasses[color], sizeClasses[size])}
      />
    </div>
  )
}
