import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CallSession } from "@/components/call/CallSession";

type Props = {
  params: Promise<{ room: string }>;
};

export default async function CallPage({ params }: Props) {
  const { room } = await params;
  const roomId = decodeURIComponent(room);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <PageHeader title="Видео дуудлага" subtitle={`Өрөө ${roomId}`} />
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Холболт бэлдэж байна…</p>}
      >
        <CallSession roomId={roomId} />
      </Suspense>
    </main>
  );
}
