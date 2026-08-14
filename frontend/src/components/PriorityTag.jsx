const PRIORITY_COLOR = {
  Low: 'var(--priority-low)',
  Medium: 'var(--priority-medium)',
  High: 'var(--priority-high)',
};

export default function PriorityTag({ priority }) {
  const color = PRIORITY_COLOR[priority] || 'var(--color-ink-soft)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--color-ink-soft)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }}
      />
      {priority}
    </span>
  );
}
