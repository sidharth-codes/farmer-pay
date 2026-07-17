import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';

interface ModalContextValue {
  open: boolean;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a Modal');
  return ctx;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const value = useMemo(() => ({ open, close: onClose }), [open, onClose]);

  return (
    <ModalContext.Provider value={value}>
      {createPortal(
        <AnimatePresence>
          {open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                className={cn(
                  'relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-soft',
                  className,
                )}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
                {children}
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </ModalContext.Provider>
  );
}

export function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4 pr-8">{children}</div>;
}

export function ModalTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-lg font-semibold">{children}</h2>;
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">{children}</div>
  );
}
