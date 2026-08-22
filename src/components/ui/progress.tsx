"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-stone-200/80 shadow-inner",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-emerald-600 transition-all duration-500 ease-out rounded-full",
          indicatorClassName
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

function ProgressTrack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-stone-200/80",
        className
      )}
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-full bg-emerald-600 transition-all rounded-full", className)}
      style={style}
      {...props}
    />
  )
}

export { Progress, ProgressTrack, ProgressIndicator }
