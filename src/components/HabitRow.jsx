import { Icon } from '../lib/icons'
import { isComplete, completionRatio, streakOf } from '../lib/useHabits'

export default function HabitRow({ habit, value, date, logs, onToggle, onInc, onEdit, onDelete }) {
  const complete = isComplete(habit, value)
  const ratio = completionRatio(habit, value)
  const streak = streakOf(habit, logs, date)

  return (
    <div className={`habit-row${complete ? ' complete' : ''}`}>
      <div className="habit-icon" style={{ background: `${habit.color}22`, color: habit.color }}>
        <span>{habit.icon}</span>
      </div>
      <div className="habit-info">
        <div className="habit-name">{habit.name}</div>
        <div className="habit-meta">
          {habit.type === 'count' && (
            <span>Target: {habit.target} {habit.unit || ''}</span>
          )}
          {habit.type === 'binary' && <span>Daily check-in</span>}
          {streak > 0 && (
            <span className="streak-pill"><Icon.Flame /> {streak} day{streak === 1 ? '' : 's'}</span>
          )}
        </div>
      </div>
      <div className="habit-action">
        {onEdit && (
          <button className="btn btn-ghost btn-icon" onClick={() => onEdit(habit)} title="Edit">
            <Icon.Edit />
          </button>
        )}
        {onDelete && (
          <button className="btn btn-ghost btn-icon btn-danger" onClick={() => onDelete(habit)} title="Delete">
            <Icon.Trash />
          </button>
        )}
        {habit.type === 'binary' ? (
          <button
            className={`check-btn${complete ? ' checked' : ''}`}
            onClick={() => onToggle(habit, date)}
            aria-label={complete ? 'Mark incomplete' : 'Mark complete'}
          >
            <Icon.Check />
          </button>
        ) : (
          <div className={`counter${complete ? ' complete' : ''}`}>
            <button
              className="counter-btn"
              onClick={() => onInc(habit, date, -1)}
              disabled={!value}
              aria-label="Decrease"
            >
              <Icon.Minus />
            </button>
            <div className="counter-value">
              {value || 0}<span className="target">/{habit.target}</span>
            </div>
            <button
              className="counter-btn"
              onClick={() => onInc(habit, date, 1)}
              aria-label="Increase"
            >
              <Icon.PlusSmall />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
