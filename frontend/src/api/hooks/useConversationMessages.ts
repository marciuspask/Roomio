import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useConversationMessages(conversationId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["messages", conversationId, limit, offset],
    queryFn: () =>
      apiClient
        .getMessagesApiV1ConversationsConversationIdMessagesGet(conversationId, { limit, offset })
        .then((r) => r.data),
    enabled: !!conversationId,
  });
}
