import { useEffect, useRef, useState } from 'react'
import { Icon } from '../lib/icons'

const MODES = {
  focus: { label: 'Focus', mins: 25, color: 'var(--accent)' },
  short: { label: 'Short break', mins: 5, color: 'var(--accent-2)' },
  long: { label: 'Long break', mins: 15, color: 'var(--success)' },
}

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
  const [mode, setMode] = useState('focus')
  const [secs, setSecs] = useState(MODES.focus.mins * 60)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          ding()
          if (mode === 'focus') onSessionComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, mode, onSessionComplete])

  useEffect(() => {
    setSecs(MODES[mode].mins * 60)
    setRunning(false)
  }, [mode])

  const total = MODES[mode].mins * 60
  const progress = (total - secs) / total
  const radius = 140
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  const reset = () => { setRunning(false); setSecs(MODES[mode].mins * 60) }
  const skip = () => { setRunning(false); setSecs(0); if (mode === 'focus') onSessionComplete?.() }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Focus</div>
          <div className="page-subtitle">Pomodoro technique — work in 25-minute sprints.</div>
        </div>
      </div>

      <div className="panel lg">
        <div className="timer-wrap">
          <div className="timer-modes">
            {Object.entries(MODES).map(([k, m]) => (
              <button
                key={k}
                className={`timer-mode${mode === k ? ' active' : ''}`}
                onClick={() => setMode(k)}
              >
                {m.label}
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
            <div className="timer-label">{MODES[mode].label}</div>
          </div>

          <div className="timer-controls">
            <button className="timer-btn" onClick={reset} title="Reset">
              <Icon.Reset />
            </button>
            <button className="timer-btn primary" onClick={() => setRunning((r) => !r)} title={running ? 'Pause' : 'Start'}>
              {running ? <Icon.Pause /> : <Icon.Play />}
            </button>
            <button className="timer-btn" onClick={skip} title="Skip">
              <Icon.Skip />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
