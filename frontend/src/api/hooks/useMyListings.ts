import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useMyListings() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: () =>
      apiClient.getMyListingsApiV1ListingsMyGet().then((res) => res.data),
  });
}
