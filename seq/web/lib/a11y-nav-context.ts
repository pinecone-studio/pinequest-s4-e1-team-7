"use client";

import { createContext, useContext } from "react";
import type { ConversationSummary } from "@/lib/chat-api";

export type ThreadAction = "call" | "voice" | "typing" | "history";

/**
 * preChatIndex:
 *   0 → "Хайлт"
 *   1..N → numberedConversations[preChatIndex-1] (тогтмол дугаартай)
 */
export type A11yNavContextValue = {
  preChatIndex: number;
  preChatContactNumber: number | null;
  contactNumbers: Record<string, number>;
  numberedConversations: ConversationSummary[];
  threadAction: ThreadAction;
  brailleOpen: boolean;
  brailleVisible: boolean;
  historyFocusId: number | null;
  setPrechatIndex: (i: number) => void;
  setThreadAction: (a: ThreadAction) => void;
  setBrailleOpen: (open: boolean) => void;
};

export const A11yNavContext = createContext<A11yNavContextValue | null>(null);

export function useA11yNav(): A11yNavContextValue | null {
  return useContext(A11yNavContext);
}
