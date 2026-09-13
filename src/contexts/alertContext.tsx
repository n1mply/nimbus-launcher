import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { AlertItem } from "../CustomAlert";

export type AlertStyle = "default" | "error" | "success";

export interface AlertData {
  id: string;
  message: string;
  style: AlertStyle;
  duration: number;
}

interface AlertContextType {
  showAlert: (message: string, style?: AlertStyle) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showAlert = useCallback(
    (message: string, style: AlertStyle = "default") => {
      setAlerts((prev) => {
        if (prev.some((a) => a.message === message && a.style === style))
          return prev;

        const baseTime = Math.max(3000, message.length * 60);
        const duration = baseTime + (style === "error" ? 1000 : 0);

        const newAlert: AlertData = {
          id: Math.random().toString(36).substring(2, 9),
          message,
          style,
          duration,
        };

        // (FIFO)
        return [...prev, newAlert];
      });
    },
    [],
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      <div className="fixed top-6 left-0 right-0 z-[100] pointer-events-none">
        <div className="relative w-full h-full">
          {alerts.map((alert, index) => (
            <AlertItem key={alert.id} alert={alert} index={index} />
          ))}
        </div>
      </div>
    </AlertContext.Provider>
  );
}
