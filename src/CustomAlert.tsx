import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useAlert, AlertData } from "./contexts/alertContext";

const ICONS = {
  default: <Info size={18} className="text-gray-400" />,
  error: <AlertTriangle size={18} className="text-red-400" />,
  success: <CheckCircle size={18} className="text-blue-400" />,
};

const STYLES = {
  default: "bg-[#1A1C23]/95 border-white/10 text-gray-200 shadow-xl",
  error: "bg-[#2A1114]/95 border-red-500/40 text-red-200 shadow-red-900/30",
  success: "bg-blue-900/80 border-blue-500/40 text-blue-200 shadow-blue-900/30",
};


export function AlertItem({ alert, index }: { alert: AlertData; index: number }) {
  const { removeAlert } = useAlert();
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  useEffect(() => {
    if (index !== 0 || isExiting) return;

    const timer = setTimeout(() => {
      handleClose();
    }, alert.duration);

    return () => clearTimeout(timer);
  }, [index, isExiting, alert.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeAlert(alert.id), 300);
  };

  const translateY = !isMounted || isExiting ? -40 : index * -12;
  const scale = !isMounted || isExiting ? 0.9 : 1 - index * 0.05;
  const opacity = !isMounted || isExiting ? 0 : 1 - index * 0.15;
  const zIndex = 50 - index;
  const isHidden = index > 2;

  return (
    <div
      onClick={index === 0 ? handleClose : undefined}
      className={`absolute top-0 flex w-max max-w-[400px] cursor-pointer items-center gap-3 rounded-xl border p-3.5 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        STYLES[alert.style]
      }`}
      style={{
        transform: `translate(-50%, ${translateY}px) scale(${scale})`,
        transformOrigin: "top center",
        opacity: isHidden ? 0 : opacity,
        zIndex,
        pointerEvents: index === 0 && !isExiting ? "auto" : "none",
        left: "50%",
      }}
    >
      <div className="shrink-0">{ICONS[alert.style]}</div>
      <span className="text-[14px] font-medium leading-snug">
        {alert.message}
      </span>
    </div>
  );
}

export function AlertContainer() {

  return null;
}
