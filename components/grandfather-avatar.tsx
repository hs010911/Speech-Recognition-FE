"use client"

interface GrandfatherAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GrandfatherAvatar({ size = "md", className = "" }: GrandfatherAvatarProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div
      className={`${sizes[size]} ${className} relative`}
      role="img"
      aria-label="할아버지 연습 상대 캐릭터"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-card bg-gradient-to-b from-secondary to-muted shadow-lg">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="50" cy="50" r="50" fill="#f5f5f4" />
          <ellipse cx="50" cy="30" rx="30" ry="20" fill="#9ca3af" />
          <ellipse cx="25" cy="40" rx="8" ry="12" fill="#9ca3af" />
          <ellipse cx="75" cy="40" rx="8" ry="12" fill="#9ca3af" />
          <ellipse cx="50" cy="55" rx="28" ry="30" fill="#fcd9b6" />
          <ellipse cx="22" cy="55" rx="6" ry="8" fill="#fcd9b6" />
          <ellipse cx="78" cy="55" rx="6" ry="8" fill="#fcd9b6" />
          <path d="M32 45 Q38 42 44 45" stroke="#6b7280" strokeWidth="2" fill="none" />
          <path d="M56 45 Q62 42 68 45" stroke="#6b7280" strokeWidth="2" fill="none" />
          <ellipse cx="38" cy="52" rx="4" ry="3" fill="#374151" />
          <ellipse cx="62" cy="52" rx="4" ry="3" fill="#374151" />
          <circle cx="39" cy="51" r="1" fill="white" />
          <circle cx="63" cy="51" r="1" fill="white" />
          <path d="M30 58 Q32 60 30 62" stroke="#d4a574" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M70 58 Q68 60 70 62" stroke="#d4a574" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M50 54 Q52 60 50 65 Q48 60 50 54" fill="#e8c4a0" />
          <path d="M35 72 Q42 68 50 70 Q58 68 65 72" fill="#9ca3af" />
          <path d="M40 76 Q50 82 60 76" stroke="#c9937a" strokeWidth="2" fill="none" />
          <rect x="30" y="48" width="16" height="12" rx="2" stroke="#374151" strokeWidth="2" fill="none" />
          <rect x="54" y="48" width="16" height="12" rx="2" stroke="#374151" strokeWidth="2" fill="none" />
          <path d="M46 52 L54 52" stroke="#374151" strokeWidth="2" />
          <path d="M22 52 L30 50" stroke="#374151" strokeWidth="2" />
          <path d="M78 52 L70 50" stroke="#374151" strokeWidth="2" />
          <path d="M30 90 Q35 85 50 88 Q65 85 70 90 L75 100 L25 100 Z" fill="#3b82f6" />
        </svg>
      </div>
    </div>
  )
}
