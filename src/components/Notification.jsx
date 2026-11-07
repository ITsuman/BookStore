import { useApp } from "../context/AppContext";
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";
import "./Notification.css";

export default function Notification() {
  const { notification, notify } = useApp();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle size={18} />,
    info: <Info size={18} />,
    error: <AlertCircle size={18} />,
  };

  return (
    <div className={`notification notification--${notification.type}`} role="alert">
      {icons[notification.type] || icons.info}
      <span>{notification.message}</span>
      <button onClick={() => notify(null)} className="notif-close" aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}
