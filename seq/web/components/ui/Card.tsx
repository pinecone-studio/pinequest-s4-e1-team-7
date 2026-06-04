import { cx } from "@/lib/utils";

interface Props {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className, children }: Props) {
  return (
    <div className={cx("db-card", className)}>
      {title && <div className="db-card-h">{title}</div>}
      {children}
    </div>
  );
}
