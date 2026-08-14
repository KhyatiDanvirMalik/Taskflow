export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        background: '#fbe9e7',
        border: '1px solid var(--priority-high)',
        color: '#7a2e26',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        margin: '0 0 16px',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          background: 'none',
          border: 'none',
          color: '#7a2e26',
          fontWeight: 700,
          fontSize: '14px',
          padding: '0 2px',
        }}
      >
        ×
      </button>
    </div>
  );
}
