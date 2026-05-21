const KEYS = {
  habits: 'flow.habits',
  logs: 'flow.logs',
  notes: 'flow.notes',
  pomodoro: 'flow.pomodoro',
  meta: 'flow.meta',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('save failed', e)
  }
}

export const STORAGE = KEYS

export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateFromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

// Pomodoro log entries may be the legacy shape (a plain number = session count,
// before per-session minutes were tracked) or the new shape { sessions, minutes }.
// Old entries are assumed to be 25-minute sessions for backfill purposes.
export function normalizeFocusEntry(entry) {
  if (!entry) return { sessions: 0, minutes: 0 }
  if (typeof entry === 'number') return { sessions: entry, minutes: entry * 25 }
  return { sessions: entry.sessions || 0, minutes: entry.minutes || 0 }
}
