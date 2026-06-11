import { Dictionary } from "@/components/dashboard/dict/Dictionary";
import { getSigns } from "@/lib/api";
import type { DictCategory } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function DictPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = (cat as DictCategory | undefined) ?? "alphabet";

  // "numbers" → "number" (server schema)
  const serverCategory = category === "numbers" ? "number" : "alphabet";
  const signs = await getSigns(serverCategory);

  return <Dictionary category={category} signs={signs} />;
}
