"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Icon } from "@/components/ui/Icon";
import { cx, initial } from "@/lib/utils";

export function AvatarMenu({ onSettings }: { onSettings: () => void }) {
  const { user, setUser } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <div className="dbava-wrap" ref={ref}>
      <button className="dbava" onClick={() => setOpen((o) => !o)}>{initial(user?.name ?? "Х")}</button>
      <div className={cx("dbmenu", open && "open")}>
        <div className="u">
          <div className="nm">{user?.name}</div>
          <div className="em">{user?.email}</div>
        </div>
        <button onClick={() => { onSettings(); setOpen(false); }}><Icon name="settings" size={17} /> Тохиргоо</button>
        <button className="danger" onClick={logout}><Icon name="log-out" size={17} /> Гарах</button>
      </div>
    </div>
  );
}
