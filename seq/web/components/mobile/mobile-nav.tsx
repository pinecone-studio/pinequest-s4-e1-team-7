"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon as HomeO,
  HandRaisedIcon as HandO,
  MicrophoneIcon as MicO,
  ChatBubbleLeftRightIcon as ChatO,
  BookOpenIcon as BookO,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeS,
  HandRaisedIcon as HandS,
  MicrophoneIcon as MicS,
  ChatBubbleLeftRightIcon as ChatS,
  BookOpenIcon as BookS,
} from "@heroicons/react/24/solid";

const tabs = [
  { href: "/dashboard/overview",   O: HomeO,  S: HomeS,  label: "Нүүр"   },
  { href: "/dashboard/translator", O: HandO,  S: HandS,  label: "Дохио"  },
  { href: "/dashboard/voice",      O: MicO,   S: MicS,   label: "Яриа"   },
  { href: "/dashboard/call",       O: ChatO,  S: ChatS,  label: "Чат"    },
  { href: "/dashboard/dict",       O: BookO,  S: BookS,  label: "Толь"   },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="z-40 shrink-0 md:hidden"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border-c)",
        backdropFilter: "blur(12px)",
      }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1">
        {tabs.map(({ href, O, S, label }) => {
          const resolvedHref =
            href === "/dashboard/call" && pathname.startsWith("/accessible")
              ? "/accessible/chat"
              : href;
          const active =
            pathname === resolvedHref ||
            pathname.startsWith(`${resolvedHref}/`) ||
            (href === "/dashboard/call" && pathname.startsWith("/accessible/chat"));
          const Icon = active ? S : O;
          return (
            <li key={href} className="flex-1">
              <Link
                href={resolvedHref}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className="flex flex-col items-center gap-1 py-1"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                  style={active ? { background: "var(--olive)" } : {}}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    style={active ? { color: "#0d1e35" } : { color: "var(--text-3)" }}
                    aria-hidden
                  />
                </span>
                <span
                  className="text-[11px] font-semibold leading-none transition-colors duration-200"
                  style={{ color: active ? "var(--olive)" : "var(--text-3)" }}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
