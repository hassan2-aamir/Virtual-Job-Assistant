import { useState, useEffect } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState extends ToastProps {
  id: number;
  visible: boolean;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = ({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
    const id = toastCount++;
    
    setToasts(prev => [
      ...prev,
      { id, title, description, variant, visible: true }
    ]);

    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, visible: false } : t)
      );
      
      // Remove from array after transition
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  };

  return { toast, toasts };
}

// Add a simple toast component to render the toasts
export function Toast() {
  const { toasts } = useToast();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`p-4 rounded-md shadow-md transition-all ${
            toast.visible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
          } ${
            toast.variant === 'destructive' ? 'bg-destructive text-white' : 'bg-background border'
          }`}
        >
          {toast.title && <h4 className="font-medium">{toast.title}</h4>}
          {toast.description && <p className="text-sm">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}