import { useEffect, useRef, useState } from 'react'
import { Icon } from '../lib/icons'
import { load, save } from '../lib/storage'

const SETTINGS_KEY = 'flow.timerSettings'

const DEFAULTS = {
  focus: 25,
  short: 5,
  long: 15,
  autoStartBreaks: false,
  sound: true,
}

const LABELS = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

const PRESETS = [
  { name: 'Classic', focus: 25, short: 5, long: 15 },
  { name: 'Long focus', focus: 50, short: 10, long: 30 },
  { name: 'Deep work', focus: 90, short: 20, long: 30 },
  { name: 'Sprint', focus: 15, short: 3, long: 10 },
]

function format(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ding() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.value = 880
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2)
    o.start()
    o.stop(ctx.currentTime + 1.3)
  } catch {}
}

export default function Focus({ onSessionComplete }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...load(SETTINGS_KEY, {}) }))
  const [mode, setMode] = useState('focus')
  const [secs, setSecs] = useState(settings.focus * 60)
  const [running, setRunning] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { save(SETTINGS_KEY, settings) }, [settings])

  useEffect(() => {
    setSecs(settings[mode] * 60)
    setRunning(false)
  }, [mode, settings.focus, settings.short, settings.long])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          if (settings.sound) ding()
          if (mode === 'focus') onSessionComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, mode, onSessionComplete, settings.sound])

  const total = settings[mode] * 60
  const progress = total === 0 ? 0 : (total - secs) / total
  const radius = 140
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  const reset = () => { setRunning(false); setSecs(settings[mode] * 60) }
  const skip = () => { setRunning(false); setSecs(0); if (mode === 'focus') onSessionComplete?.() }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Focus</div>
          <div className="page-subtitle">
            Work in {settings.focus}-minute sprints — fully customizable below.
          </div>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setSettingsOpen(true)}>
            <Icon.Settings /> Customize
          </button>
        </div>
      </div>

      <div className="panel lg">
        <div className="timer-wrap">
          <div className="timer-modes">
            {Object.keys(LABELS).map((k) => (
              <button
                key={k}
                className={`timer-mode${mode === k ? ' active' : ''}`}
                onClick={() => setMode(k)}
              >
                {LABELS[k]} <span style={{ opacity: 0.6, marginLeft: 4, fontWeight: 500 }}>{settings[k]}m</span>
              </button>
            ))}
          </div>

          <div className="timer-circle">
            <svg width="320" height="320">
              <defs>
                <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c5cff" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <circle className="bg-track" cx="160" cy="160" r={radius} fill="none" strokeWidth="10" />
              <circle
                className="progress"
                cx="160"
                cy="160"
                r={radius}
                fill="none"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="timer-time">{format(secs)}</div>
            <div className="timer-label">{LABELS[mode]}</div>
          </div>

          <div className="timer-controls">
            <button className="timer-btn" onClick={reset} title="Reset">
              <Icon.Reset />
            </button>
            <button
              className="timer-btn primary"
              onClick={() => setRunning((r) => !r)}
              title={running ? 'Pause' : 'Start'}
            >
              {running ? <Icon.Pause /> : <Icon.Play />}
            </button>
            <button className="timer-btn" onClick={skip} title="Skip">
              <Icon.Skip />
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <TimerSettings
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

function TimerSettings({ settings, onChange, onClose }) {
  const [draft, setDraft] = useState(settings)

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const setMin = (key, raw) => {
    const n = Math.max(1, Math.min(180, Number(raw) || 1))
    set(key, n)
  }

  const apply = () => { onChange(draft); onClose() }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="modal-title">Customize timer</div>
            <div className="modal-sub">Set durations in minutes (1–180).</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon.Close />
          </button>
        </div>

        <div className="field">
          <label className="field-label">Quick presets</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map((p) => {
              const isActive = draft.focus === p.focus && draft.short === p.short && draft.long === p.long
              return (
                <button
                  key={p.name}
                  type="button"
                  className={`btn${isActive ? ' btn-primary' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, focus: p.focus, short: p.short, long: p.long }))}
                >
                  {p.name} <span style={{ opacity: 0.7, marginLeft: 4, fontWeight: 500 }}>
                    {p.focus}/{p.short}/{p.long}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Focus</label>
            <input
              className="input"
              type="number"
              min="1"
              max="180"
              value={draft.focus}
              onChange={(e) => setMin('focus', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Short break</label>
            <input
              className="input"
              type="number"
              min="1"
              max="180"
              value={draft.short}
              onChange={(e) => setMin('short', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Long break</label>
            <input
              className="input"
              type="number"
              min="1"
              max="180"
              value={draft.long}
              onChange={(e) => setMin('long', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Options</label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={draft.sound}
              onChange={(e) => set('sound', e.target.checked)}
            />
            <span>Play a chime when the timer ends</span>
          </label>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDraft({ ...DEFAULTS })}
          >
            Reset to defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={apply}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
