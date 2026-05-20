import { useState } from 'react'
import { Icon } from '../lib/icons'

export default function Notes({ notes, onAdd, onDelete }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Notes</div>
          <div className="page-subtitle">Capture thoughts before they slip away.</div>
        </div>
      </div>

      <form className="note-composer" onSubmit={submit}>
        <textarea
          className="textarea"
          placeholder="Write something... (Cmd/Ctrl + Enter to save)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e)
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>{text.length} chars</div>
          <button className="btn btn-primary" type="submit" disabled={!text.trim()}>
            <Icon.Plus /> Add note
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="panel lg">
          <div className="empty">
            <div className="empty-icon"><Icon.Note /></div>
            <div className="empty-title">No notes yet</div>
            <div>Your captured thoughts will appear here.</div>
          </div>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((n) => (
            <div className="note-card" key={n.id}>
              <div className="note-actions">
                <button
                  className="btn btn-ghost btn-icon btn-danger"
                  onClick={() => onDelete(n.id)}
                  title="Delete"
                >
                  <Icon.Trash />
                </button>
              </div>
              <div className="note-text">{n.text}</div>
              <div className="note-date">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
