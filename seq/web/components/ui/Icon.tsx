import { icons, type LucideProps } from "lucide-react";

interface Props extends LucideProps {
  name: string;
}

export function Icon({ name, ...rest }: Props) {
  const key = name
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[key];
  return Cmp ? <Cmp {...rest} /> : null;
}
