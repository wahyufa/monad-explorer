"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { cn } from "@/lib/utils"

interface RealtimeChartProps {
  data: any[]
  dataKey: string
  color?: string
  type?: "line" | "area"
  height?: number
  className?: string
  animate?: boolean
}

export function RealtimeChart({
  data,
  dataKey,
  color = "#7151d5",
  type = "line",
  height = 200,
  className,
  animate = true,
}: RealtimeChartProps) {
  const [animatedData, setAnimatedData] = useState<any[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!animate) {
      setAnimatedData(data)
      return
    }

    if (data.length === 0) return

    setIsUpdating(true)

    // Animate data points appearing one by one
    const animateDataPoints = async () => {
      const newData: any[] = []

      for (let i = 0; i < data.length; i++) {
        newData.push(data[i])
        setAnimatedData([...newData])
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      setIsUpdating(false)
    }

    animateDataPoints()
  }, [data, animate])

  const ChartComponent = type === "area" ? AreaChart : LineChart

  return (
    <div className={cn("relative", className)}>
      {isUpdating && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-monad-purple rounded-full animate-pulse" />
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={animatedData}>
          {type === "area" && (
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}

          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #2a2a3e",
              borderRadius: "8px",
              color: "#fff",
            }}
          />

          {type === "area" ? (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
              animationDuration={800}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              animationDuration={800}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
