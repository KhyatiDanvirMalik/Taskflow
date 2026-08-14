const OPTIONS = ['All', 'Low', 'Medium', 'High'];

export default function FilterBar({ value, onChange, searchValue, onSearchChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '4px' }} role="group" aria-label="Filter by priority">
        {OPTIONS.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              aria-pressed={active}
              style={{
                border: '1px solid ' + (active ? 'var(--color-accent)' : 'var(--color-line)'),
                background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-ink-soft)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by title…"
        aria-label="Search tasks by title"
        style={{
          border: '1px solid var(--color-line)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '12.5px',
          background: 'var(--color-surface)',
          minWidth: '180px',
        }}
      />
    </div>
  );
}
