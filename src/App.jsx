import { useCallback, useEffect, useState } from 'react'
import { Icon } from './lib/icons'
import { useHabits } from './lib/useHabits'
import { STORAGE, load, save, todayKey, uid } from './lib/storage'
import HabitModal from './components/HabitModal'
import Today from './views/Today'
import Habits from './views/Habits'
import Notes from './views/Notes'
import Focus from './views/Focus'
import Stats from './views/Stats'

const TABS = [
  { id: 'today', label: 'Today', icon: <Icon.Home /> },
  { id: 'habits', label: 'Habits', icon: <Icon.Target /> },
  { id: 'notes', label: 'Notes', icon: <Icon.Note /> },
  { id: 'focus', label: 'Focus', icon: <Icon.Timer /> },
  { id: 'stats', label: 'Stats', icon: <Icon.Stats /> },
]

export default function App() {
  const [tab, setTab] = useState(() => load('flow.tab', 'today'))
  const { habits, logs, addHabit, updateHabit, deleteHabit, toggleHabit, incrementHabit } = useHabits()

  const [notes, setNotes] = useState(() => load(STORAGE.notes, []))
  const [pomodoroLog, setPomodoroLog] = useState(() => load(STORAGE.pomodoro, {}))
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => { save('flow.tab', tab) }, [tab])
  useEffect(() => { save(STORAGE.notes, notes) }, [notes])
  useEffect(() => { save(STORAGE.pomodoro, pomodoroLog) }, [pomodoroLog])

  const addNote = useCallback((text) => {
    setNotes((prev) => [{ id: uid(), text, createdAt: Date.now() }, ...prev])
  }, [])

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const recordPomodoro = useCallback(() => {
    setPomodoroLog((prev) => {
      const k = todayKey()
      return { ...prev, [k]: (prev[k] || 0) + 1 }
    })
  }, [])

  const todayPomodoros = pomodoroLog[todayKey()] || 0

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Icon.Logo /></div>
          <span>Flow</span>
        </div>
        <nav className="nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-item${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--success)', boxShadow: '0 0 8px var(--success)'
          }} />
          Saved locally
        </div>
      </aside>

      <main className="main">
        {tab === 'today' && (
          <Today
            habits={habits}
            logs={logs}
            onToggle={toggleHabit}
            onInc={incrementHabit}
            onAdd={() => setQuickAddOpen(true)}
            recentNote={notes[0]}
            onAddNote={addNote}
            pomodoroCount={todayPomodoros}
          />
        )}
        {tab === 'habits' && (
          <Habits
            habits={habits}
            logs={logs}
            onAdd={addHabit}
            onUpdate={updateHabit}
            onDelete={deleteHabit}
            onToggle={toggleHabit}
            onInc={incrementHabit}
          />
        )}
        {tab === 'notes' && (
          <Notes notes={notes} onAdd={addNote} onDelete={deleteNote} />
        )}
        {tab === 'focus' && (
          <Focus onSessionComplete={recordPomodoro} />
        )}
        {tab === 'stats' && (
          <Stats habits={habits} logs={logs} pomodoroLog={pomodoroLog} />
        )}
      </main>

      <HabitModal
        open={quickAddOpen}
        initial={null}
        onClose={() => setQuickAddOpen(false)}
        onSave={(data) => { addHabit(data); setQuickAddOpen(false) }}
      />
    </div>
  )
}
