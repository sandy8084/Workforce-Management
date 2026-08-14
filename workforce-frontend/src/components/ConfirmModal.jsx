function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '360px' }}
      >
        <h3 style={{ marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 16px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
            style={{ background: danger ? '#dc2626' : undefined, backgroundImage: danger ? 'none' : undefined }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;