const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const Icon = {
  Logo: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M5 12l4 4 10-12" />
    </svg>
  ),
  Home: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  Target: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  Note: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M9 10h6M9 14h6" />
    </svg>
  ),
  Timer: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 3h6" />
    </svg>
  ),
  Stats: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  Plus: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Check: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth="3" {...p}>
      <path d="M5 12l5 5 9-12" />
    </svg>
  ),
  Minus: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M5 12h14" />
    </svg>
  ),
  PlusSmall: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Trash: (p) => (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
    </svg>
  ),
  Edit: (p) => (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M4 20h4l10-10-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  Play: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  Reset: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  ),
  Skip: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M5 4l10 8-10 8z" />
      <path d="M19 4v16" />
    </svg>
  ),
  Flame: (p) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2c1 3 5 5 5 10a5 5 0 1 1-10 0c0-2 1-3 2-4-1 4 3 4 3 0 0-2-1-4 0-6z" />
    </svg>
  ),
  Empty: (p) => (
    <svg width="28" height="28" viewBox="0 0 24 24" {...stroke} {...p}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M9 3v6M15 3v6M4 11h16" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  ),
  Settings: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Close: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
}
