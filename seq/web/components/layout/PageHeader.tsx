import Link from "next/link";

type Props = {
  backHref?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function PageHeader({ backHref = "/", title, subtitle, right }: Props) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Буцах
          </Link>
        )}
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 font-mono text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </header>
  );
}
