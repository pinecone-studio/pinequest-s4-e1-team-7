import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { href: "#features", label: "Онцлог" },
  { href: "#how", label: "Апп ашиглах заавар" },
];

export const Header = () => (
  <nav className="lnav">
    <Link href="/" className="lnav-logo">
      <img src="/images/logo.png" alt="Sign Bridge" className="h-10 w-10 object-contain" />
    </Link>

    <div className="lnav-links">
      {NAV_LINKS.map((l) => (
        <a key={l.href} href={l.href}>{l.label}</a>
      ))}
    </div>

    <div className="lnav-right">
      <ThemeToggle />

      <Show when="signed-out">
        <Link href="/auth/login" className="db-pillbtn hidden sm:inline-flex">
          Нэвтрэх
        </Link>
        <Link href="/auth/register" className="db-pillbtn green">
          <UserPlusIcon className="h-4 w-4" /> Бүртгүүлэх
        </Link>
      </Show>

      <Show when="signed-in">
        <Link href="/dashboard" className="db-pillbtn green">Эхлэх</Link>
        <UserButton />
      </Show>
    </div>
  </nav>
);
