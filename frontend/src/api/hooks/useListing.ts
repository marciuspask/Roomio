import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () =>
      apiClient.getListingApiV1ListingsListingIdGet(id).then((res) => res.data),
    enabled: !!id,
  });
}
