"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { a11ySpeak } from "@/lib/a11y-speak";
import { setStoredAppMode } from "@/lib/accessibility-mode";

type Props = {
  /** Зөвхөн mobile дээр */
  enabled?: boolean;
};

/** Дэлгэцийн доод 50% дарвал харааны бэрхшээлтэй чат руу шилжинэ */
export function BottomHalfShortcut({ enabled = true }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  if (!enabled) return null;

  return (
    <button
      type="button"
      aria-label="Харааны бэрхшээлтэй горим — доод тал"
      className="fixed inset-x-0 bottom-0 z-[100] h-[50dvh] touch-manipulation md:hidden"
      style={{ background: "transparent" }}
      onClick={() => {
        setStoredAppMode("accessible");
        a11ySpeak("Харааны бэрхшээлтэй горим.");
        if (user) {
          router.push("/accessible/chat");
        } else {
          router.push("/auth/login?next=/accessible/chat");
        }
      }}
    />
  );
}
