import { Suspense } from "react";
import { CallSession } from "@/components/call/CallSession";

type Props = {
  params: Promise<{ room: string }>;
};

export default async function CallPage({ params }: Props) {
  const { room } = await params;
  const roomId = decodeURIComponent(room);

  return (
    <Suspense fallback={null}>
      <CallSession roomId={roomId} />
    </Suspense>
  );
}
