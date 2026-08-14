import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13.5px',
              fontWeight: 500,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              background: t.type === 'error' ? '#dc2626' : '#16a34a',
              minWidth: '240px',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}