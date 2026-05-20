import { useEffect, useState } from 'react'
import { DEFAULT_ICONS, DEFAULT_COLORS } from '../lib/useHabits'

export default function HabitModal({ open, initial, onClose, onSave }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ICONS[0])
  const [color, setColor] = useState(DEFAULT_COLORS[0])
  const [type, setType] = useState('binary')
  const [target, setTarget] = useState(1)
  const [unit, setUnit] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setIcon(initial?.icon || DEFAULT_ICONS[0])
      setColor(initial?.color || DEFAULT_COLORS[0])
      setType(initial?.type || 'binary')
      setTarget(initial?.target || 1)
      setUnit(initial?.unit || '')
    }
  }, [open, initial])

  if (!open) return null

  const submit = (e) => {
    e?.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      icon,
      color,
      type,
      target: type === 'count' ? Math.max(1, Number(target) || 1) : 1,
      unit: type === 'count' ? unit.trim() : '',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-title">{initial ? 'Edit habit' : 'New habit'}</div>
        <div className="modal-sub">Design a habit you can stick with. Small wins compound.</div>

        <div className="field">
          <label className="field-label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 10 pages"
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label">Type</label>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-option${type === 'binary' ? ' selected' : ''}`}
              onClick={() => setType('binary')}
            >
              <div className="type-option-title">Yes / No</div>
              <div className="type-option-desc">A single daily check-off</div>
            </button>
            <button
              type="button"
              className={`type-option${type === 'count' ? ' selected' : ''}`}
              onClick={() => setType('count')}
            >
              <div className="type-option-title">Count-based</div>
              <div className="type-option-desc">Hit a daily target number</div>
            </button>
          </div>
        </div>

        {type === 'count' && (
          <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
            <div>
              <label className="field-label">Target</label>
              <input
                className="input"
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Unit (optional)</label>
              <input
                className="input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="glasses, pages, min..."
              />
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label">Icon</label>
          <div className="icon-picker">
            {DEFAULT_ICONS.map((i) => (
              <button
                type="button"
                key={i}
                className={`icon-option${icon === i ? ' selected' : ''}`}
                onClick={() => setIcon(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Color</label>
          <div className="color-picker">
            {DEFAULT_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={`color-option${color === c ? ' selected' : ''}`}
                onClick={() => setColor(c)}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            {initial ? 'Save changes' : 'Create habit'}
          </button>
        </div>
      </form>
    </div>
  )
}
