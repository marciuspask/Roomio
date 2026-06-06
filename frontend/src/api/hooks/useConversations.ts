import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useConversations(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["conversations", limit, offset],
    queryFn: () =>
      apiClient
        .getMyConversationsApiV1ConversationsGet({ limit, offset })
        .then((r) => r.data),
  });
}
