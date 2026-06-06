import { Dictionary } from "@/components/dashboard/Dictionary";
import type { DictCategory } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function DictPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  return <Dictionary category={(cat as DictCategory | undefined) ?? "alphabet"} />;
}
