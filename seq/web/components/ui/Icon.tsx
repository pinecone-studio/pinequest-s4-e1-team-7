import { icons, type LucideProps } from "lucide-react";

interface Props extends LucideProps {
  name: string;
}

/** Render a lucide icon by kebab-case name (e.g. "arrow-right"). */
export function Icon({ name, ...rest }: Props) {
  const key = name
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[key];
  return Cmp ? <Cmp {...rest} /> : null;
}
