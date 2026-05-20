import { useMemo, useState } from 'react'
import { Icon } from '../lib/icons'
import { isComplete, completionRatio, streakOf, longestStreak, completionPct } from '../lib/useHabits'
import { todayKey } from '../lib/storage'

function getYearGrid() {
  const days = []
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 364)
  const dow = start.getDay()
  start.setDate(start.getDate() - dow)
  for (let d = new Date(start); d <= end || days.length % 7 !== 0; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  return days
}

export default function Stats({ habits, logs, pomodoroLog }) {
  const [selectedHabitId, setSelectedHabitId] = useState('all')

  const summary = useMemo(() => {
    if (habits.length === 0) return null
    const items = habits.map((h) => ({
      habit: h,
      currentStreak: streakOf(h, logs),
      longest: longestStreak(h, logs),
      pct: completionPct(h, logs),
    }))
    return items.sort((a, b) => b.currentStreak - a.currentStreak)
  }, [habits, logs])

  const days = useMemo(() => getYearGrid(), [])

  const heatmapValues = useMemo(() => {
    return days.map((d) => {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayLogs = logs[k] || {}
      const isFuture = d > new Date()
      if (selectedHabitId === 'all') {
        if (habits.length === 0) return { date: k, level: 0, ratio: 0, future: isFuture }
        let sum = 0
        habits.forEach((h) => {
          if (!h.createdAt || k >= h.createdAt) sum += completionRatio(h, dayLogs[h.id])
        })
        const eligible = habits.filter((h) => !h.createdAt || k >= h.createdAt).length
        const r = eligible === 0 ? 0 : sum / eligible
        return { date: k, level: levelFor(r), ratio: r, future: isFuture }
      } else {
        const h = habits.find((x) => x.id === selectedHabitId)
        if (!h) return { date: k, level: 0, ratio: 0, future: isFuture }
        const r = completionRatio(h, dayLogs[h.id])
        return { date: k, level: levelFor(r), ratio: r, future: isFuture }
      }
    })
  }, [days, logs, habits, selectedHabitId])

  const overallStats = useMemo(() => {
    let totalCompletions = 0
    let activeDays = new Set()
    Object.entries(logs).forEach(([k, day]) => {
      habits.forEach((h) => {
        if (isComplete(h, day[h.id])) {
          totalCompletions += 1
          activeDays.add(k)
        }
      })
    })
    const bestStreak = habits.reduce((m, h) => Math.max(m, longestStreak(h, logs)), 0)
    const focusTotal = Object.values(pomodoroLog || {}).reduce((a, b) => a + b, 0)
    return {
      totalCompletions,
      activeDays: activeDays.size,
      bestStreak,
      focusTotal,
    }
  }, [logs, habits, pomodoroLog])

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Stats</div>
          <div className="page-subtitle">Your progress over time.</div>
        </div>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Best streak</div>
          <div className="stat-value">{overallStats.bestStreak}<span className="stat-suffix">days</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total check-ins</div>
          <div className="stat-value">{overallStats.totalCompletions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active days</div>
          <div className="stat-value">{overallStats.activeDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Focus sessions</div>
          <div className="stat-value">{overallStats.focusTotal}</div>
        </div>
      </div>

      <div className="panel lg" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Activity</div>
          <select
            className="select"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
          >
            <option value="all">All habits</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
            ))}
          </select>
        </div>

        <div className="heatmap">
          {heatmapValues.map((v, i) => (
            <div
              key={i}
              className={`heatmap-cell l${v.level}${v.future ? ' future' : ''}`}
              title={`${v.date} — ${Math.round(v.ratio * 100)}%`}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-cell l0" />
          <div className="heatmap-cell l1" />
          <div className="heatmap-cell l2" />
          <div className="heatmap-cell l3" />
          <div className="heatmap-cell l4" />
          <span>More</span>
        </div>
      </div>

      {summary && summary.length > 0 && (
        <div className="panel lg">
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Per-habit breakdown</div>
          <div className="habit-list">
            {summary.map(({ habit, currentStreak, longest, pct }) => (
              <div className="habit-row" key={habit.id}>
                <div className="habit-icon" style={{ background: `${habit.color}22`, color: habit.color }}>
                  <span>{habit.icon}</span>
                </div>
                <div className="habit-info">
                  <div className="habit-name">{habit.name}</div>
                  <div className="habit-meta">
                    <span>Current: <strong style={{ color: 'var(--text)' }}>{currentStreak}d</strong></span>
                    <span>Best: <strong style={{ color: 'var(--text)' }}>{longest}d</strong></span>
                    <span>Completion: <strong style={{ color: 'var(--text)' }}>{Math.round(pct * 100)}%</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && (
        <div className="panel lg">
          <div className="empty">
            <div className="empty-icon"><Icon.Stats /></div>
            <div className="empty-title">No data yet</div>
            <div>Add habits and check them off to see your progress here.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function levelFor(ratio) {
  if (ratio <= 0) return 0
  if (ratio < 0.34) return 1
  if (ratio < 0.67) return 2
  if (ratio < 1) return 3
  return 4
}
