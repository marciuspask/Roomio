import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      apiClient
        .getMessagesApiV1ConversationsConversationIdMessagesGet(conversationId)
        .then((r) => r.data),
    enabled: !!conversationId,
  });
}
