import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

interface Toast {
  id: number;
  text: string;
  icon: string;
}
interface ToastCtx {
  toast: (text: string, icon?: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const toast = useCallback((text: string, icon = 'spark') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <Icon name={t.icon} size={18} className="toast__icon" />
              <span className="toast__text">{t.text}</span>
            </div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}
