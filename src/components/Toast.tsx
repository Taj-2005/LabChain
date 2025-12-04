"use client";

import { useState, createContext, useContext, ReactNode } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  id?: string;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info",
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
    duration = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { message, type, duration, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ message, type = "info" }: ToastProps) {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 opacity-100`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
