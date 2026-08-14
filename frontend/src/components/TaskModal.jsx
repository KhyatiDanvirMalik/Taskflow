import { useState } from 'react';

export default function TaskModal({ mode, initialTask, columnName, onSave, onClose, isSaving }) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'Medium');
  const [titleError, setTitleError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim().length === 0) {
      setTitleError('Title is required.');
      return;
    }
    setTitleError('');
    onSave({ title: title.trim(), description: description.trim(), priority });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 35, 33, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 50,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          padding: '22px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 12px 36px rgba(27,35,33,0.18)',
        }}
      >
        <h2
          id="task-modal-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            margin: '0 0 4px',
          }}
        >
          {mode === 'create' ? 'New task' : 'Edit task'}
        </h2>
        {columnName && (
          <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'var(--color-ink-soft)' }}>
            in {columnName}
          </p>
        )}

        <label style={labelStyle}>
          Title
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Write launch email"
            style={inputStyle}
          />
          {titleError && (
            <span style={{ color: 'var(--priority-high)', fontSize: '12px' }}>{titleError}</span>
          )}
        </label>

        <label style={labelStyle}>
          Description <span style={{ color: 'var(--color-ink-soft)', fontWeight: 400 }}>(optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add more detail…"
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
          />
        </label>

        <label style={labelStyle}>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--color-line)',
              borderRadius: '7px',
              padding: '9px 14px',
              fontSize: '13.5px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '9px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: 'var(--color-ink)',
  marginBottom: '13px',
};

const inputStyle = {
  border: '1px solid var(--color-line)',
  borderRadius: '7px',
  padding: '9px 10px',
  fontSize: '13.5px',
  fontWeight: 400,
  background: 'var(--color-bg)',
};
