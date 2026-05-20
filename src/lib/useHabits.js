import { useCallback, useEffect, useState } from 'react'
import { STORAGE, load, save, todayKey, uid, addDays } from './storage'

export const DEFAULT_ICONS = ['💧', '📚', '🏃', '🧘', '🍎', '💤', '✍️', '🎯', '☀️', '🎨', '💪', '🌱']
export const DEFAULT_COLORS = ['#7c5cff', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#ec4899', '#a78bfa', '#60a5fa']

export function useHabits() {
  const [habits, setHabits] = useState(() => load(STORAGE.habits, []))
  const [logs, setLogs] = useState(() => load(STORAGE.logs, {}))

  useEffect(() => { save(STORAGE.habits, habits) }, [habits])
  useEffect(() => { save(STORAGE.logs, logs) }, [logs])

  const addHabit = useCallback((habit) => {
    setHabits((prev) => [...prev, { id: uid(), createdAt: todayKey(), ...habit }])
  }, [])

  const updateHabit = useCallback((id, patch) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  }, [])

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setLogs((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((date) => {
        if (next[date][id] !== undefined) {
          const dayCopy = { ...next[date] }
          delete dayCopy[id]
          next[date] = dayCopy
        }
      })
      return next
    })
  }, [])

  const setLog = useCallback((habitId, date, value) => {
    setLogs((prev) => {
      const day = { ...(prev[date] || {}) }
      if (value === null || value === undefined) {
        delete day[habitId]
      } else {
        day[habitId] = value
      }
      return { ...prev, [date]: day }
    })
  }, [])

  const toggleHabit = useCallback((habit, date) => {
    setLogs((prev) => {
      const day = { ...(prev[date] || {}) }
      if (habit.type === 'binary') {
        if (day[habit.id]) delete day[habit.id]
        else day[habit.id] = 1
      } else {
        const cur = day[habit.id] || 0
        day[habit.id] = cur >= (habit.target || 1) ? 0 : cur
        if (day[habit.id] === 0) delete day[habit.id]
      }
      return { ...prev, [date]: day }
    })
  }, [])

  const incrementHabit = useCallback((habit, date, delta) => {
    setLogs((prev) => {
      const day = { ...(prev[date] || {}) }
      const cur = day[habit.id] || 0
      const next = Math.max(0, cur + delta)
      if (next === 0) delete day[habit.id]
      else day[habit.id] = next
      return { ...prev, [date]: day }
    })
  }, [])

  return { habits, logs, addHabit, updateHabit, deleteHabit, setLog, toggleHabit, incrementHabit }
}

export function isComplete(habit, value) {
  if (!value) return false
  if (habit.type === 'binary') return value >= 1
  return value >= (habit.target || 1)
}

export function completionRatio(habit, value) {
  if (!value) return 0
  if (habit.type === 'binary') return value >= 1 ? 1 : 0
  return Math.min(1, value / (habit.target || 1))
}

export function streakOf(habit, logs, refDateKey = todayKey()) {
  let streak = 0
  let d = new Date(refDateKey + 'T00:00:00')
  const todayHasEntry = isComplete(habit, logs[refDateKey]?.[habit.id])
  if (!todayHasEntry) {
    d = addDays(d, -1)
  }
  while (true) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const created = habit.createdAt
    if (created && k < created) break
    if (isComplete(habit, logs[k]?.[habit.id])) {
      streak += 1
      d = addDays(d, -1)
    } else {
      break
    }
  }
  return streak
}

export function longestStreak(habit, logs) {
  if (!habit.createdAt) return 0
  const start = new Date(habit.createdAt + 'T00:00:00')
  const end = new Date()
  let best = 0
  let cur = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (isComplete(habit, logs[k]?.[habit.id])) {
      cur += 1
      if (cur > best) best = cur
    } else {
      cur = 0
    }
  }
  return best
}

export function completionPct(habit, logs) {
  if (!habit.createdAt) return 0
  const start = new Date(habit.createdAt + 'T00:00:00')
  const end = new Date()
  let total = 0
  let done = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    total += 1
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (isComplete(habit, logs[k]?.[habit.id])) done += 1
  }
  return total === 0 ? 0 : done / total
}
