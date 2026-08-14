import PriorityTag from './PriorityTag.jsx';

const PRIORITY_COLOR = {
  Low: 'var(--priority-low)',
  Medium: 'var(--priority-medium)',
  High: 'var(--priority-high)',
};

export default function TaskCard({ task, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)',
        borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] || 'var(--color-line)'}`,
        padding: '12px 12px 12px 11px',
        marginBottom: '8px',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14.5px',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '13px',
            color: 'var(--color-ink-soft)',
            lineHeight: 1.45,
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}
      >
        <PriorityTag priority={task.priority} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            style={cardButtonStyle}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            style={{ ...cardButtonStyle, color: 'var(--priority-high)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const cardButtonStyle = {
  background: 'none',
  border: 'none',
  padding: '2px 5px',
  fontSize: '12px',
  color: 'var(--color-ink-soft)',
  borderRadius: '4px',
};
