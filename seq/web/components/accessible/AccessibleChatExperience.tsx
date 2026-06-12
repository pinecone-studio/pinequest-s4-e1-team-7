"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessagesApp } from "@/components/messages/MessagesApp";
import { a11ySpeak } from "@/lib/a11y-speak";

export function AccessibleChatExperience() {
  const greetedRef = useRef(false);

  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    a11ySpeak(
      "Харааны бэрхшээлтэй чат. Нэг хуруу баруун зүүн — товч. Нэг хуруу хоёр дар — орох. Хоёр хуруу баруун — буцах.",
    );
  }, []);

  const messagesProps = useMemo(
    () => ({
      chatBasePath: "/accessible/chat",
      settingsPath: "/dashboard/settings",
      a11yMode: true,
      hideInputFooter: true,
    }),
    [],
  );

  return <MessagesApp {...messagesProps} />;
}
