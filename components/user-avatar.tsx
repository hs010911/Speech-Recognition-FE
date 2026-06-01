"use client"

import { cn } from "@/lib/utils"

interface UserAvatarProps {
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ size = "md", className }: UserAvatarProps) {
  const sizes = {
    xs: "h-9 w-9",
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const borders = {
    xs: "border",
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
  }

  const emojiSizes = {
    xs: "text-lg",
    sm: "text-xl",
    md: "text-4xl",
    lg: "text-5xl",
  }

  return (
    <div
      className={cn("relative shrink-0", sizes[size], className)}
      role="img"
      aria-label="내 프로필"
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-emerald-100 shadow-sm",
          borders[size],
          "border-card"
        )}
      >
        <span className={cn(emojiSizes[size], "leading-none select-none")} aria-hidden>
          😊
        </span>
      </div>
    </div>
  )
}
