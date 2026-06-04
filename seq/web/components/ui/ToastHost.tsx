"use client";
import { useApp } from "@/context/AppContext";
import { Icon } from "./Icon";

export function ToastHost() {
  const { toasts } = useApp();
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          <span className="t-ic">
            <Icon name={t.icon} size={17} />
          </span>
          <span className="t-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
