import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, body }: { listingId: string; body: string }) =>
      apiClient
        .startConversationApiV1ListingsListingIdMessagePost(listingId, { body })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
