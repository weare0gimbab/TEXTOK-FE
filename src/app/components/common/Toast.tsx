'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onRemove: (id: string) => void;
}

function Toast({ id, message, type, duration = 3000, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const typeConfig = {
    success: {
      icon: <Check className="h-5 w-5 text-green-600" />,
      colors: 'bg-white border-green-200 text-green-800'
    },
    error: {
      icon: <X className="h-5 w-5 text-red-600" />,
      colors: 'bg-white border-red-200 text-red-800'
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      colors: 'bg-white border-yellow-200 text-yellow-800'
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-600" />,
      colors: 'bg-white border-blue-200 text-blue-800'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`
      flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full
      ${config.colors}
    `}>
      {config.icon}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="ml-auto text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [mounted] = useState<boolean>(() => typeof document !== 'undefined');

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  );
}

// Toast Hook
export function useToast() {
  const nextId = useRef(0);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  }>>([]);

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = String(nextId.current++);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const createToastMethod = (type: ToastType) => (message: string, duration?: number) =>
    addToast(message, type, duration);

  const success = createToastMethod('success');
  const error = createToastMethod('error');
  const info = createToastMethod('info');
  const warning = createToastMethod('warning');

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
}
