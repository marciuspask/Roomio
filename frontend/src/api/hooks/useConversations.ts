import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      apiClient.getMyConversationsApiV1ConversationsGet().then((r) => r.data),
  });
}
