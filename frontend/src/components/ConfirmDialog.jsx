export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 35, 33, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          padding: '20px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 12px 36px rgba(27,35,33,0.18)',
        }}
      >
        <h2 id="confirm-title" style={{ fontFamily: 'var(--font-display)', fontSize: '16px', margin: '0 0 8px' }}>
          {title}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--color-ink-soft)', margin: '0 0 18px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: '1px solid var(--color-line)',
              borderRadius: '7px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: 'var(--priority-high)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
