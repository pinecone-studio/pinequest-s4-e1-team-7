"use client";

import { createContext, useContext } from "react";

export type ThreadAction = "call" | "voice" | "typing" | "history";

/**
 * preChatIndex:
 *   0 → "Хайлт" товч
 *   1..N → conversations[preChatIndex-1]
 *   (search нэрсний тоогоор replace хийгдэнэ)
 */
export type A11yNavContextValue = {
  preChatIndex: number;
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
