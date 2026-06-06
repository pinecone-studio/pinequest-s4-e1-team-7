import Link from "next/link";
import { features } from "@/lib/features";

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map(({ href, title, subtitle, icon: Icon, tint }) => (
        <Link
          key={href}
          href={href}
          className="rounded-2xl border bg-card p-4 transition hover:border-primary/40 active:scale-95"
        >
          <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${tint}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </Link>
      ))}
    </div>
  );
}
