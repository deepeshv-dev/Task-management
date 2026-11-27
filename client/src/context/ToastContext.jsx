import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => remove(id), 3600);
  }, [remove]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.type === 'error' ? XCircle : toast.type === 'info' ? Info : CheckCircle2;
          return (
            <div className={`toast toast-${toast.type}`} key={toast.id} role="status">
              <Icon size={18} /><span>{toast.message}</span>
              <button className="icon-button toast-close" aria-label="Dismiss notification" onClick={() => remove(toast.id)}><X size={15} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
