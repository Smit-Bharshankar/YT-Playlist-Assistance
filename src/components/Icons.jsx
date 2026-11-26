function Svg({ size = 16, className, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function LinkIcon({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-2 2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l2-2" />
    </Svg>
  )
}

export function Search({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

export function Download({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </Svg>
  )
}

export function Upload({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 21V9" />
      <path d="m7 14 5-5 5 5" />
      <path d="M5 3h14" />
    </Svg>
  )
}

export function ChevronDown({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function Alert({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Svg>
  )
}

export function Note({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h7" />
      <path d="M8 17h4" />
    </Svg>
  )
}

export function Clock({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  )
}

export function Close({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </Svg>
  )
}

export function Play({ size = 16, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
    </Svg>
  )
}
