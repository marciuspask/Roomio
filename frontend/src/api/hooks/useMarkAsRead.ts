import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.markAsReadApiV1ConversationsConversationIdReadPost(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}
