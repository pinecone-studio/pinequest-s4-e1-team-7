import { MessagesApp } from "@/components/messages/MessagesApp";
import { fetchServerConversations, fetchServerMessages } from "@/lib/server-api";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const convId = decodeURIComponent(id);

  const [initialConversations, initialMessages] = await Promise.all([
    fetchServerConversations(),
    fetchServerMessages(convId),
  ]);

  return (
    <MessagesApp
      initialConversations={initialConversations}
      initialMessages={initialMessages}
      initialConvId={convId}
    />
  );
}
