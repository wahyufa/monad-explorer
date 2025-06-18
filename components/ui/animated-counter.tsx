"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: string | number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 1000, className, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>("")
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef<string>("")

  useEffect(() => {
    const stringValue = value.toString()

    // Only animate if the value has actually changed
    if (stringValue === previousValue.current) {
      return
    }

    console.log("AnimatedCounter: Value changed from", previousValue.current, "to", stringValue)

    const numericValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.-]/g, "")) : value

    if (isNaN(numericValue)) {
      setDisplayValue(stringValue)
      previousValue.current = stringValue
      return
    }

    const currentValue = Number.parseFloat(displayValue.replace(/[^0-9.-]/g, "")) || 0

    if (currentValue === numericValue) {
      previousValue.current = stringValue
      return
    }

    setIsAnimating(true)
    const startTime = Date.now()
    const startValue = currentValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentAnimatedValue = startValue + (numericValue - startValue) * easeOutQuart

      // Format the value based on original format
      let formattedValue: string
      if (typeof value === "string" && value.includes("K")) {
        formattedValue = `${(currentAnimatedValue / 1000).toFixed(1)}K`
      } else if (typeof value === "string" && value.includes("M")) {
        formattedValue = `${(currentAnimatedValue / 1000000).toFixed(1)}M`
      } else if (typeof value === "string" && value.includes(".")) {
        formattedValue = currentAnimatedValue.toFixed(3)
      } else {
        formattedValue = Math.round(currentAnimatedValue).toLocaleString()
      }

      setDisplayValue(formattedValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        previousValue.current = stringValue
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={cn("transition-all duration-300", isAnimating && "text-monad-purple", className)}>
      {prefix}
      {displayValue || value}
      {suffix}
    </span>
  )
}
