import type { Env } from "@/db";

export type ChatPushEvent = {
  type: "chat";
  conversationId: string;
  messageId: number;
  kind: string;
};

export async function pushToUser(
  env: Env,
  userId: string,
  event: ChatPushEvent,
): Promise<void> {
  if (!env.USER_NOTIFY) return;
  const stub = env.USER_NOTIFY.get(env.USER_NOTIFY.idFromName(userId));
  await stub.fetch(
    new Request("https://do/push", {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    }),
  );
}

export function pushToPeer(
  env: Env,
  conv: { userAId: string; userBId: string },
  senderId: string,
  event: ChatPushEvent,
): void {
  const peerId = conv.userAId === senderId ? conv.userBId : conv.userAId;
  void pushToUser(env, peerId, event).catch(() => {});
}
