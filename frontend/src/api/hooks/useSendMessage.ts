import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { MessagesResponse } from "@/api/generated/data-contracts";

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      apiClient
        .sendMessageApiV1ConversationsConversationIdMessagesPost(conversationId, { body })
        .then((r) => r.data),
    onSuccess: (response, { conversationId }) => {
      const message = response.data;
      // Append the real message to any cached messages query for this conversation
      queryClient.setQueriesData<MessagesResponse>(
        { queryKey: ["messages", conversationId] },
        (old) => {
          if (!old) return { data: [message], total: 1, limit: 50, offset: 0 };
          if (old.data.some((m) => m.id === message.id)) return old;
          return { ...old, data: [...old.data, message] };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
