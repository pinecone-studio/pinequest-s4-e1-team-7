import { MessagesApp } from "@/components/messages/MessagesApp";
import { fetchServerConversations } from "@/lib/server-api";

export default async function CallPage() {
  const initialConversations = await fetchServerConversations();
  return <MessagesApp initialConversations={initialConversations} />;
}
