import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type Variant = "green" | "ghost" | "teal";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "green", className, children, ...rest }: Props) {
  return (
    <button className={cx("db-pillbtn", variant, className)} {...rest}>
      {children}
    </button>
  );
}
