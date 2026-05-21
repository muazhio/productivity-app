import { useMemo, useState } from 'react'
import { Icon } from '../lib/icons'
import { isComplete, completionRatio, streakOf, longestStreak, completionPct } from '../lib/useHabits'
import { todayKey, normalizeFocusEntry, dateFromKey } from '../lib/storage'

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

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatMins(m) {
  if (!m) return '0m'
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}m`
  if (r === 0) return `${h}h`
  return `${h}h ${r}m`
}

function lastNDays(n) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export default function Stats({ habits, logs, pomodoroLog }) {
  const [selectedHabitId, setSelectedHabitId] = useState('all')
  const [focusRange, setFocusRange] = useState(14)

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
      const k = dayKey(d)
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

    let totalFocusMin = 0
    let totalFocusSessions = 0
    Object.values(pomodoroLog || {}).forEach((v) => {
      const e = normalizeFocusEntry(v)
      totalFocusMin += e.minutes
      totalFocusSessions += e.sessions
    })

    return {
      totalCompletions,
      activeDays: activeDays.size,
      bestStreak,
      totalFocusMin,
      totalFocusSessions,
    }
  }, [logs, habits, pomodoroLog])

  const focusChart = useMemo(() => {
    const days = lastNDays(focusRange)
    const points = days.map((d) => {
      const k = dayKey(d)
      const e = normalizeFocusEntry(pomodoroLog?.[k])
      return { date: d, key: k, minutes: e.minutes, sessions: e.sessions }
    })
    const max = Math.max(60, ...points.map((p) => p.minutes))
    const total = points.reduce((s, p) => s + p.minutes, 0)
    const activeDayCount = points.filter((p) => p.minutes > 0).length
    const avgActive = activeDayCount === 0 ? 0 : Math.round(total / activeDayCount)
    const avgAll = Math.round(total / focusRange)
    const best = points.reduce((b, p) => (p.minutes > b.minutes ? p : b), points[0])
    return { points, max, total, avgActive, avgAll, activeDayCount, best }
  }, [pomodoroLog, focusRange])

  const todayFocus = normalizeFocusEntry(pomodoroLog?.[todayKey()])
  const thisWeekFocus = useMemo(() => {
    const days = lastNDays(7)
    return days.reduce((sum, d) => sum + normalizeFocusEntry(pomodoroLog?.[dayKey(d)]).minutes, 0)
  }, [pomodoroLog])

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
          <div className="stat-label">Total focus time</div>
          <div className="stat-value">{formatMins(overallStats.totalFocusMin)}</div>
        </div>
      </div>

      <div className="panel lg" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Focus time</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
              How long you spent learning, by day.
            </div>
          </div>
          <div className="timer-modes" style={{ marginBottom: 0 }}>
            {[7, 14, 30].map((n) => (
              <button
                key={n}
                className={`timer-mode${focusRange === n ? ' active' : ''}`}
                onClick={() => setFocusRange(n)}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>

        <div className="focus-summary">
          <div className="focus-summary-cell">
            <div className="focus-summary-label">Today</div>
            <div className="focus-summary-val">{formatMins(todayFocus.minutes)}</div>
            <div className="focus-summary-sub">{todayFocus.sessions} session{todayFocus.sessions === 1 ? '' : 's'}</div>
          </div>
          <div className="focus-summary-cell">
            <div className="focus-summary-label">Last 7 days</div>
            <div className="focus-summary-val">{formatMins(thisWeekFocus)}</div>
            <div className="focus-summary-sub">{formatMins(Math.round(thisWeekFocus / 7))} / day avg</div>
          </div>
          <div className="focus-summary-cell">
            <div className="focus-summary-label">Avg per active day</div>
            <div className="focus-summary-val">{formatMins(focusChart.avgActive)}</div>
            <div className="focus-summary-sub">{focusChart.activeDayCount} of {focusRange} days active</div>
          </div>
          <div className="focus-summary-cell">
            <div className="focus-summary-label">Best day ({focusRange}d)</div>
            <div className="focus-summary-val">{formatMins(focusChart.best?.minutes || 0)}</div>
            <div className="focus-summary-sub">
              {focusChart.best && focusChart.best.minutes > 0
                ? focusChart.best.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : 'no sessions yet'}
            </div>
          </div>
        </div>

        <FocusBarChart points={focusChart.points} max={focusChart.max} avg={focusChart.avgAll} />
      </div>

      <div className="panel lg" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Habit activity</div>
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

      {habits.length === 0 && overallStats.totalFocusMin === 0 && (
        <div className="panel lg">
          <div className="empty">
            <div className="empty-icon"><Icon.Stats /></div>
            <div className="empty-title">No data yet</div>
            <div>Add habits or run a focus session to start seeing stats.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function FocusBarChart({ points, max, avg }) {
  const niceMax = Math.ceil(max / 30) * 30 || 30
  const ticks = [0, niceMax / 2, niceMax]
  const avgRatio = niceMax === 0 ? 0 : avg / niceMax

  return (
    <div className="bar-chart">
      <div className="bar-chart-grid">
        {ticks.slice().reverse().map((t) => (
          <div className="bar-chart-tick" key={t}>
            <span>{formatMins(t)}</span>
            <div className="bar-chart-line" />
          </div>
        ))}
        {avg > 0 && (
          <div
            className="bar-chart-avg"
            style={{ bottom: `${avgRatio * 100}%` }}
            title={`Average: ${formatMins(avg)}`}
          >
            <span>avg {formatMins(avg)}</span>
          </div>
        )}
      </div>
      <div className="bar-chart-bars">
        {points.map((p, i) => {
          const ratio = niceMax === 0 ? 0 : p.minutes / niceMax
          const isToday = p.key === todayKey()
          return (
            <div className="bar-col" key={p.key} title={`${p.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} — ${formatMins(p.minutes)} (${p.sessions} session${p.sessions === 1 ? '' : 's'})`}>
              <div className="bar-val">{p.minutes > 0 ? formatMins(p.minutes) : ''}</div>
              <div className="bar-track">
                <div
                  className={`bar-fill${isToday ? ' today' : ''}${p.minutes === 0 ? ' empty' : ''}`}
                  style={{ height: `${Math.max(p.minutes > 0 ? 3 : 0, ratio * 100)}%` }}
                />
              </div>
              <div className={`bar-label${isToday ? ' today' : ''}`}>
                {points.length <= 14
                  ? p.date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)
                  : p.date.getDate()}
              </div>
            </div>
          )
        })}
      </div>
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
