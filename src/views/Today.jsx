import { useMemo } from 'react'
import HabitRow from '../components/HabitRow'
import { Icon } from '../lib/icons'
import { isComplete, completionRatio, streakOf } from '../lib/useHabits'
import { todayKey } from '../lib/storage'
import { quoteOfTheDay } from '../lib/quotes'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Wind down'
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatMins(m) {
  if (!m) return '0m'
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}m`
  if (r === 0) return `${h}h`
  return `${h}h ${r}m`
}

export default function Today({ habits, logs, onToggle, onInc, onAdd, recentNote, onAddNote, todayFocus }) {
  const date = todayKey()
  const dayLogs = logs[date] || {}

  const stats = useMemo(() => {
    if (habits.length === 0) return { done: 0, total: 0, ratio: 0, longestStreak: 0 }
    let done = 0
    let ratioSum = 0
    let longestStreak = 0
    habits.forEach((h) => {
      const v = dayLogs[h.id]
      if (isComplete(h, v)) done += 1
      ratioSum += completionRatio(h, v)
      const s = streakOf(h, logs, date)
      if (s > longestStreak) longestStreak = s
    })
    return {
      done,
      total: habits.length,
      ratio: habits.length === 0 ? 0 : ratioSum / habits.length,
      longestStreak,
    }
  }, [habits, logs, date, dayLogs])

  const pct = Math.round(stats.ratio * 100)
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - stats.ratio * c

  return (
    <div className="fade-in">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="dash-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      <div className="greeting">{greeting()}.</div>
      <div className="date-line">{formatDate()}</div>

      <div className="quote-bar">
        <Icon.Sparkle style={{ marginRight: 8, verticalAlign: -3, color: 'var(--accent)' }} />
        “{quoteOfTheDay()}”
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Today's Progress</div>
          <div className="day-progress" style={{ marginTop: 6 }}>
            <div className="ring">
              <svg width="64" height="64">
                <circle className="ring-bg" cx="32" cy="32" r={r} fill="none" strokeWidth="6" />
                <circle
                  className="ring-fg"
                  cx="32"
                  cy="32"
                  r={r}
                  fill="none"
                  strokeWidth="6"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="ring-text">{pct}%</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {stats.done}<span className="stat-suffix">/ {stats.total}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>habits done</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Longest current streak</div>
          <div className="stat-value">
            {stats.longestStreak}<span className="stat-suffix">days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Focus time today</div>
          <div className="stat-value">
            {formatMins(todayFocus?.minutes || 0)}
            <span className="stat-suffix">
              · {todayFocus?.sessions || 0} session{(todayFocus?.sessions || 0) === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Today's habits</div>
            <button className="btn btn-primary" onClick={onAdd}>
              <Icon.Plus /> New habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Icon.Target /></div>
              <div className="empty-title">No habits yet</div>
              <div>Create your first habit and start a streak today.</div>
            </div>
          ) : (
            <div className="habit-list">
              {habits.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  value={dayLogs[h.id]}
                  date={date}
                  logs={logs}
                  onToggle={onToggle}
                  onInc={onInc}
                />
              ))}
            </div>
          )}
        </div>

        <div className="panel lg">
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Quick note</div>
          <QuickNote onAddNote={onAddNote} />
          {recentNote && (
            <div style={{ marginTop: 18 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>Most recent</div>
              <div className="note-card" style={{ minHeight: 'auto' }}>
                <div className="note-text">{recentNote.text}</div>
                <div className="note-date">{new Date(recentNote.createdAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickNote({ onAddNote }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const text = e.currentTarget.note.value.trim()
        if (!text) return
        onAddNote(text)
        e.currentTarget.reset()
      }}
    >
      <textarea
        name="note"
        className="textarea"
        placeholder="Capture a thought... (Cmd/Ctrl + Enter to save)"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.currentTarget.form.requestSubmit()
          }
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button className="btn btn-primary" type="submit"><Icon.Plus /> Save note</button>
      </div>
    </form>
  )
}
