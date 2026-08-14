import { useState } from 'react';
import TaskCard from './TaskCard.jsx';

export default function Column({
  column,
  tasks,
  allColumns,
  onEdit,
  onDelete,
  onMove,
  onAddTask,
  draggingTaskId,
  onDragStart: onDragStartTask,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragStart(e, task) {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
    onDragStartTask?.(task.id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (taskId) onMove(taskId, column.id);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        background: isDragOver ? 'var(--color-accent-soft)' : 'transparent',
        borderRadius: '10px',
        padding: '8px',
        width: '290px',
        flexShrink: 0,
        transition: 'background 0.12s ease',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '4px 6px 10px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {column.name}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-ink-soft)',
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '0 2px' }}>
        {tasks.map((task) => (
          <div key={task.id}>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={handleDragStart}
              onDragEnd={() => onDragStartTask?.(null)}
              isDragging={draggingTaskId === task.id}
            />
            {/* Dropdown fallback for moving a task — works without drag-and-drop,
                and is more accessible (keyboard + screen reader friendly). */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--color-ink-soft)',
                margin: '-4px 0 10px 2px',
              }}
            >
              Move to
              <select
                value={column.id}
                onChange={(e) => onMove(task.id, Number(e.target.value))}
                style={{
                  border: '1px solid var(--color-line)',
                  borderRadius: '5px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  background: 'var(--color-surface)',
                }}
              >
                {allColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}

        {tasks.length === 0 && (
          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--color-ink-soft)',
              padding: '10px 6px',
              margin: 0,
            }}
          >
            No tasks here yet.
          </p>
        )}
      </div>

      <button
        onClick={() => onAddTask(column.id)}
        style={{
          marginTop: '8px',
          background: 'none',
          border: '1px dashed var(--color-line)',
          borderRadius: '7px',
          padding: '8px',
          fontSize: '13px',
          color: 'var(--color-ink-soft)',
          fontWeight: 500,
        }}
      >
        + Add task
      </button>
    </div>
  );
}
