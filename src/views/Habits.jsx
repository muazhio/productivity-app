import { useState } from 'react'
import HabitRow from '../components/HabitRow'
import HabitModal from '../components/HabitModal'
import { Icon } from '../lib/icons'
import { todayKey } from '../lib/storage'

export default function Habits({ habits, logs, onAdd, onUpdate, onDelete, onToggle, onInc }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const date = todayKey()
  const dayLogs = logs[date] || {}

  const handleSave = (data) => {
    if (editing) onUpdate(editing.id, data)
    else onAdd(data)
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = (h) => {
    if (confirm(`Delete habit "${h.name}"? This will erase its history.`)) {
      onDelete(h.id)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Habits</div>
          <div className="page-subtitle">Build consistency. One small win at a time.</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Icon.Plus /> New habit
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="panel lg">
          <div className="empty">
            <div className="empty-icon"><Icon.Target /></div>
            <div className="empty-title">No habits yet</div>
            <div>Click <strong>New habit</strong> to get started. Try something small like "Read 5 minutes" or "Drink 8 glasses of water".</div>
          </div>
        </div>
      ) : (
        <div className="panel lg">
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
                onEdit={(habit) => { setEditing(habit); setModalOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <HabitModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
